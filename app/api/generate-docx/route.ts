import { NextRequest, NextResponse } from 'next/server';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from 'docx';
import type { AnalysisResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const analysis: AnalysisResult = await request.json();

    const roleText = analysis.role === 'customer' ? 'Заказчик' : 'Подрядчик';

    const NONE_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    const CELL_BORDER = {
      top: { style: BorderStyle.SINGLE, size: 1, color: '3f3f5a' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '3f3f5a' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '3f3f5a' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '3f3f5a' },
    };

    const disagreementItems = analysis.disagreementProtocol || [];

    const itemSections = disagreementItems.flatMap((item, index) => [
      new Paragraph({
        spacing: { before: 400, after: 100 },
        children: [
          new TextRun({
            text: `${index + 1}. Пункт ${item.clauseNumber}: ${item.clauseTitle}`,
            bold: true,
            size: 24,
            color: '1a1a2e',
          }),
        ],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'f0f0f8' },
                borders: CELL_BORDER,
                children: [
                  new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                      new TextRun({
                        text: 'Редакция договора',
                        bold: true,
                        size: 20,
                        color: '1a1a2e',
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'e8f5e9' },
                borders: CELL_BORDER,
                children: [
                  new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                      new TextRun({
                        text: 'Редакция протокола разногласий',
                        bold: true,
                        size: 20,
                        color: '1a3a1a',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: CELL_BORDER,
                children: [
                  new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                      new TextRun({
                        text: item.originalText || 'Текст пункта отсутствует',
                        size: 18,
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                borders: CELL_BORDER,
                children: [
                  new Paragraph({
                    spacing: { before: 100, after: 100 },
                    children: [
                      new TextRun({
                        text: item.proposedText || 'Предлагаемый текст отсутствует',
                        size: 18,
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100, after: 80 },
        children: [
          new TextRun({ text: 'Проблема: ', bold: true, size: 18, color: '8b2000' }),
          new TextRun({ text: item.issue || '', size: 18 }),
        ],
      }),
      new Paragraph({
        spacing: { before: 80, after: 200 },
        children: [
          new TextRun({ text: 'Обоснование: ', bold: true, size: 18 }),
          new TextRun({ text: item.justification || '', size: 18 }),
        ],
      }),
    ]);

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Times New Roman', size: 24 },
          },
        },
      },
      sections: [
        {
          properties: {
            page: {
              margin: { top: 1440, bottom: 1440, left: 1800, right: 1200 },
            },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [
                new TextRun({
                  text: 'ПРОТОКОЛ РАЗНОГЛАСИЙ',
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: `к ${analysis.contractTitle || 'договору'}`,
                  size: 24,
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              children: [
                new TextRun({ text: `Дата составления: ${analysis.analysisDate}`, size: 22 }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              children: [
                new TextRun({ text: `Составлен с позиции: ${roleText}а`, size: 22 }),
              ],
            }),
            new Paragraph({
              spacing: { after: 300 },
              children: [
                new TextRun({
                  text: 'Настоящий Протокол разногласий составлен в соответствии со ст. 443–445 Гражданского кодекса Российской Федерации в связи с несогласием стороны с отдельными условиями договора. Просим рассмотреть и согласовать предлагаемые изменения.',
                  size: 22,
                }),
              ],
            }),
            new Paragraph({
              spacing: { before: 200, after: 200 },
              children: [
                new TextRun({ text: 'ПЕРЕЧЕНЬ РАЗНОГЛАСИЙ', bold: true, size: 26 }),
              ],
            }),
            ...itemSections,
            new Paragraph({
              spacing: { before: 600, after: 200 },
              children: [
                new TextRun({ text: 'ПОДПИСИ СТОРОН', bold: true, size: 26 }),
              ],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: NONE_BORDER,
                bottom: NONE_BORDER,
                left: NONE_BORDER,
                right: NONE_BORDER,
                insideHorizontal: NONE_BORDER,
                insideVertical: NONE_BORDER,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: {
                        top: NONE_BORDER,
                        bottom: NONE_BORDER,
                        left: NONE_BORDER,
                        right: NONE_BORDER,
                      },
                      children: [
                        new Paragraph({
                          spacing: { after: 100 },
                          children: [new TextRun({ text: 'Заказчик:', bold: true, size: 22 })],
                        }),
                        new Paragraph({
                          spacing: { after: 600 },
                          children: [new TextRun({ text: '________________________', size: 22 })],
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: 'ФИО ________________', size: 20 })],
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: 'Должность ___________', size: 20 })],
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: 'Дата ________________', size: 20 })],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: {
                        top: NONE_BORDER,
                        bottom: NONE_BORDER,
                        left: NONE_BORDER,
                        right: NONE_BORDER,
                      },
                      children: [
                        new Paragraph({
                          spacing: { after: 100 },
                          children: [new TextRun({ text: 'Подрядчик:', bold: true, size: 22 })],
                        }),
                        new Paragraph({
                          spacing: { after: 600 },
                          children: [new TextRun({ text: '________________________', size: 22 })],
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: 'ФИО ________________', size: 20 })],
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: 'Должность ___________', size: 20 })],
                        }),
                        new Paragraph({
                          children: [new TextRun({ text: 'Дата ________________', size: 20 })],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const uint8 = new Uint8Array(buffer);

    return new NextResponse(uint8, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('Протокол разногласий.docx')}`,
      },
    });
  } catch (error) {
    console.error('DOCX generation error:', error);
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { error: `Ошибка при создании документа: ${message}` },
      { status: 500 }
    );
  }
}
