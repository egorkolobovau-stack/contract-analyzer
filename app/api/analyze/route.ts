import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { extractTextFromFile } from '@/lib/extractText';

export const maxDuration = 300;

function extractText(resp: Anthropic.Message): string {
  return resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n');
}

function parseProtocolJson(raw: string): {
  contractTitle?: string;
  overallRisk?: string;
  protocolItems?: unknown[];
} {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/```\s*$/m, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return {};

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    try {
      return JSON.parse(
        cleaned.slice(start, end + 1).replace(/[\x00-\x1F\x7F]/g, ' ')
      );
    } catch (e) {
      console.error('Protocol JSON parse failed:', e, '\nRaw:', raw.slice(0, 400));
      return {};
    }
  }
}

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

    const roleLabel    = role === 'customer' ? 'ЗАКАЗЧИКА' : 'ПОДРЯДЧИКА';
    const roleGenitive = role === 'customer' ? 'заказчика' : 'подрядчика';
    const contractText = textParts.join('\n\n---\n\n');
    const userInstructions = comments.trim()
      ? `\nДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ПОЛЬЗОВАТЕЛЯ:\n${comments.trim()}\n`
      : '';

    // Текст договора для промптов — одна переменная, без дублирования
    const contractBlock = contractText
      ? `ТЕКСТ ДОГОВОРА:\n\n${contractText}`
      : 'Договор предоставлен в виде изображений выше. Извлеки и проанализируй весь текст.';

    // ── ПРОМПТ 1: Детальный анализ → plain text ──────────────────────────────
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

    // ── ПРОМПТ 2: Протокол разногласий → JSON ────────────────────────────────
    // Получает только текст договора — БЕЗ результата анализа.
    // Это вдвое сокращает размер промпта и позволяет запускать параллельно.
    const protocolPrompt = `Ты профессиональный российский юрист. Изучи договор и составь Протокол разногласий с позиции ${roleGenitive}.
${userInstructions}
Найди все пункты договора которые ущемляют интересы ${roleGenitive} и для каждого предложи альтернативную редакцию.

Верни ТОЛЬКО JSON-объект, без пояснений, без markdown-блоков, первый символ ответа — {

{
  "contractTitle": "полное название договора",
  "overallRisk": "high|medium|low",
  "protocolItems": [
    {
      "number": 1,
      "clauseRef": "п. 3.1",
      "clauseTitle": "Краткое название пункта",
      "originalText": "Дословный текст спорного пункта из договора",
      "proposedText": "Готовая альтернативная редакция — юридически грамотная, защищающая интересы ${roleGenitive}",
      "justification": "Обоснование: почему оригинал ущемляет ${roleGenitive} и чем обоснована правка",
      "legalRef": "Ст. 421 ГК РФ"
    }
  ]
}

Требования:
- Минимум 8 пунктов, в идеале 10–14
- proposedText — готовая юридическая формулировка, не пустая
- overallRisk: "high" / "medium" / "low"
- Первый символ ответа — {

${contractBlock}`;

    console.log('[API] Contract text length:', contractText.length);
    console.log('[API] Analysis prompt length:', analysisPrompt.length);
    console.log('[API] Protocol prompt length:', protocolPrompt.length);

    // ── Параллельный запуск обоих запросов ───────────────────────────────────
    const [analysisResp, protocolResp] = await Promise.all([
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 10000,
        messages: [{ role: 'user', content: [...imageContent, { type: 'text', text: analysisPrompt }] }],
      }),
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: [...imageContent, { type: 'text', text: protocolPrompt }] }],
      }),
    ]);

    const analysisText = extractText(analysisResp);
    const protocolRaw  = extractText(protocolResp) || '{}';

    console.log('[API] Analysis stop_reason:', analysisResp.stop_reason, '| length:', analysisText.length);
    console.log('[API] Protocol stop_reason:', protocolResp.stop_reason, '| length:', protocolRaw.length);
    console.log('[API] Protocol raw preview:', protocolRaw.slice(0, 300));

    if (!analysisText.trim()) {
      throw new Error('Анализ вернул пустой текст. Проверьте API ключ и содержимое файлов.');
    }

    const protocol = parseProtocolJson(protocolRaw);

    console.log('[API] Protocol items count:', (protocol.protocolItems || []).length);
    if ((protocol.protocolItems || []).length === 0) {
      console.warn('[API] ⚠️ protocolItems empty! Raw:', protocolRaw.slice(0, 600));
    }

    return NextResponse.json({
      contractTitle: protocol.contractTitle || files[0]?.name || 'Договор',
      overallRisk:   protocol.overallRisk   || 'medium',
      role,
      analysisDate: new Date().toLocaleDateString('ru-RU', {
        year: 'numeric', month: 'long', day: 'numeric',
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
