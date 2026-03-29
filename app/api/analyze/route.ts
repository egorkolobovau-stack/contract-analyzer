import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { extractTextFromFile } from '@/lib/extractText';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const role = formData.get('role') as string;
    const comments = (formData.get('comments') as string | null) || '';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Файлы не выбраны' }, { status: 400 });
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const textParts: string[] = [];
    const imageContent: Anthropic.ImageBlockParam[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png)$/i)) {
        const mediaType = file.type.startsWith('image/') ? file.type : 'image/jpeg';
        imageContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: buffer.toString('base64'),
          },
        });
      } else {
        const text = await extractTextFromFile(buffer, file.type, file.name);
        if (text.trim()) textParts.push(`[Файл: ${file.name}]\n${text}`);
      }
    }

    const roleLabel = role === 'customer' ? 'ЗАКАЗЧИКА' : 'ПОДРЯДЧИКА';
    const roleGenitive = role === 'customer' ? 'заказчика' : 'подрядчика';
    const contractText = textParts.join('\n\n---\n\n');
    const userInstructions = comments.trim()
      ? `\nДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ПОЛЬЗОВАТЕЛЯ:\n${comments.trim()}\n`
      : '';

    const contractBlock = contractText
      ? `ТЕКСТ ДОГОВОРА:\n\n${contractText}`
      : 'Договор предоставлен в виде изображений выше. Извлеки и проанализируй весь текст.';

    // ─── PROMPT 1: Детальный анализ → plain text ───────────────────────────
    const analysisPrompt = `Ты профессиональный российский юрист с опытом более 15 лет в договорном праве. Анализируй договор максимально детально и критично, защищая интересы указанной стороны.
${userInstructions}
В начале анализа укажи: "Я представляю интересы: ${roleLabel}"

ОБЯЗАТЕЛЬНО ПРОВЕРЬ И ОПИШИ:

1. РИСКИ ДЛЯ МОЕЙ СТОРОНЫ
   - Финансовые риски
   - Операционные риски
   - Правовые риски
   - Скрытые риски и ловушки

2. ОТВЕТСТВЕННОСТЬ СТОРОН
   - Размер и условия штрафов и неустоек
   - Основания для расторжения
   - Форс-мажор — насколько широко трактуется
   - Ограничение ответственности — справедливо ли

3. МЕСТО СУДЕБНОГО РАЗБИРАТЕЛЬСТВА
   - Где рассматриваются споры
   - Выгодно ли это моей стороне
   - Альтернативные варианты разрешения споров

4. СООТВЕТСТВИЕ ГК РФ
   - Прямые противоречия нормам ГК РФ
   - Условия которые суд может признать недействительными
   - Ссылки на конкретные статьи ГК РФ

5. ОБЯЗАННОСТИ СТОРОН
   - Полный перечень моих обязанностей
   - Полный перечень обязанностей другой стороны
   - Несбалансированность обязанностей

6. ПРОБЛЕМНЫЕ ПУНКТЫ
   - Размытые формулировки которые трактуются против меня
   - Односторонние условия
   - Чего не хватает в договоре

7. ОБЩАЯ ОЦЕНКА
   - Насколько договор выгоден моей стороне (1-10)
   - Топ-3 самых критичных проблемы
   - Рекомендация: подписывать / подписывать с правками / не подписывать

${contractBlock}`;

    // ─── PROMPT 2: Протокол разногласий → JSON ─────────────────────────────
    const protocolPrompt = `Ты профессиональный российский юрист. На основе договора составь протокол разногласий с позиции ${roleGenitive}.
${userInstructions}
Верни результат строго в формате JSON (без markdown-блоков):
{
  "contractTitle": "полное название договора",
  "overallRisk": "high|medium|low",
  "protocolItems": [
    {
      "number": 1,
      "clauseRef": "п. 3.1",
      "clauseTitle": "Краткое название пункта",
      "originalText": "Точный текст пункта из договора",
      "proposedText": "Новая редакция — юридически грамотная, готовая к подписанию",
      "justification": "Подробное обоснование правки: почему данный пункт ущемляет интересы ${roleGenitive} и каков правовой аргумент",
      "legalRef": "Ст. 450 ГК РФ (или иной нормативный акт)"
    }
  ]
}

Требования:
- Минимум 8–12 пунктов в протоколе
- proposedText — готов к вставке в официальный документ без правок
- justification — содержательный, со ссылкой на конкретную норму
- Защищай интересы ${roleGenitive}
- Верни ТОЛЬКО валидный JSON

${contractBlock}`;

    const analysisContentBlocks: Anthropic.MessageParam['content'] = [
      ...imageContent,
      { type: 'text', text: analysisPrompt },
    ];

    const protocolContentBlocks: Anthropic.MessageParam['content'] = [
      ...imageContent,
      { type: 'text', text: protocolPrompt },
    ];

    // Два параллельных запроса
    const [analysisResp, protocolResp] = await Promise.all([
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: analysisContentBlocks }],
      }),
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 6000,
        messages: [{ role: 'user', content: protocolContentBlocks }],
      }),
    ]);

    // Анализ — берём текст напрямую, без JSON-парсинга
    const analysisText =
      analysisResp.content[0].type === 'text' ? analysisResp.content[0].text : '';

    // Протокол — парсим JSON, убираем возможные markdown-блоки
    const protocolRaw =
      protocolResp.content[0].type === 'text' ? protocolResp.content[0].text : '{}';

    const jsonString = protocolRaw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    const jsonStart = jsonString.indexOf('{');
    const jsonEnd = jsonString.lastIndexOf('}');
    const cleanJson =
      jsonStart !== -1 && jsonEnd !== -1
        ? jsonString.slice(jsonStart, jsonEnd + 1)
        : '{}';

    let protocol: { contractTitle?: string; overallRisk?: string; protocolItems?: unknown[] } = {};
    try {
      protocol = JSON.parse(cleanJson);
    } catch (e) {
      console.error('Protocol JSON parse error:', e, '\nRaw:', protocolRaw.slice(0, 300));
    }

    return NextResponse.json({
      contractTitle: protocol.contractTitle || files[0]?.name || 'Договор',
      overallRisk: protocol.overallRisk || 'medium',
      role,
      analysisDate: new Date().toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      analysisText,
      protocolItems: protocol.protocolItems || [],
    });
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Ошибка при анализе договора: ${message}` },
      { status: 500 }
    );
  }
}
