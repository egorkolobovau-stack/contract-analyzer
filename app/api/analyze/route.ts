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

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

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
        if (text.trim()) {
          textParts.push(`[Файл: ${file.name}]\n${text}`);
        }
      }
    }

    const roleText = role === 'customer' ? 'заказчик' : 'подрядчик';
    const roleGenitive = role === 'customer' ? 'заказчика' : 'подрядчика';
    const contractText = textParts.join('\n\n---\n\n');
    const userInstructions = comments.trim()
      ? `\nДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ПОЛЬЗОВАТЕЛЯ:\n${comments.trim()}\n`
      : '';

    const messageContent: Anthropic.MessageParam['content'] = [
      ...imageContent,
      {
        type: 'text',
        text: `Ты — опытный российский юрист, специализирующийся на договорном праве. Твоя задача — тщательно проанализировать предоставленный договор с позиции ${roleGenitive} и подготовить профессиональное заключение.
${userInstructions}
${contractText ? `ТЕКСТ ДОГОВОРА:\n\n${contractText}` : 'Договор предоставлен в виде изображений выше. Извлеки и проанализируй весь текст.'}

Предоставь детальный анализ в формате JSON строго по следующей структуре:

{
  "contractTitle": "полное название/тип договора",
  "overallRisk": "high|medium|low",
  "summary": "подробное резюме договора: что это за договор, ключевые условия, общая оценка — 3-4 абзаца",
  "risks": [
    {
      "severity": "high|medium|low",
      "clause": "номер или название пункта",
      "description": "детальное описание риска для ${roleGenitive}",
      "recommendation": "конкретная рекомендация как устранить или снизить риск"
    }
  ],
  "problematicClauses": [
    {
      "number": "номер пункта",
      "title": "название или краткое описание пункта",
      "issue": "в чём конкретно проблема этого пункта",
      "risk": "чем именно это грозит ${roleGenitive}"
    }
  ],
  "missingClauses": [
    "описание важного условия, которого нет в договоре, но которое необходимо ${roleGenitive}"
  ],
  "strengths": [
    "конкретная сильная сторона договора выгодная ${roleGenitive}"
  ],
  "weaknesses": [
    "конкретная слабая сторона договора невыгодная ${roleGenitive}"
  ],
  "recommendations": [
    "конкретная рекомендация по улучшению договора в интересах ${roleGenitive}"
  ],
  "disagreementProtocol": [
    {
      "clauseNumber": "номер пункта",
      "clauseTitle": "название/описание пункта",
      "originalText": "точный или близкий к оригиналу текст спорного пункта",
      "issue": "почему этот пункт неприемлем для ${roleGenitive}",
      "proposedText": "готовая альтернативная формулировка этого пункта — юридически грамотная, конкретная, защищающая интересы ${roleGenitive}",
      "justification": "правовое обоснование предлагаемых изменений"
    }
  ]
}

Требования:
- Минимум 5-8 рисков
- Минимум 5-8 проблемных пунктов
- Минимум 5 отсутствующих условий
- Минимум 5-8 пунктов в протоколе разногласий
- Анализируй строго с позиции ${roleGenitive}
- Протокол разногласий — это официальный юридический документ, формулировки должны быть готовы к использованию
- Верни ТОЛЬКО валидный JSON без markdown-блоков, пояснений и дополнительного текста`,
      },
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [
        {
          role: 'user',
          content: messageContent,
        },
      ],
    });

    const responseText =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in response:', responseText.substring(0, 500));
      throw new Error('Некорректный ответ от API');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    analysis.role = role;
    analysis.analysisDate = new Date().toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Ошибка при анализе договора: ${message}` },
      { status: 500 }
    );
  }
}
