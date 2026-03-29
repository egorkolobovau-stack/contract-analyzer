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
    const items = analysis.protocolItems || [];
    const roleText = analysis.role === 'customer' ? 'Заказчик' : 'Подрядчик';

    const BORDER = { style: BorderStyle.SINGLE, size: 1, color: '888888' };
    const CELL_BORDERS = {
      top: BORDER,
      bottom: BORDER,
      left: BORDER,
      right: BORDER,
    };
    const HEADER_SHADING = { type: ShadingType.SOLID, color: '2d2d5a' };

    // Строки таблицы
    const tableRows: TableRow[] = [
      // Заголовок таблицы
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            width: { size: 5, type: WidthType.PERCENTAGE },
            shading: HEADER_SHADING,
            borders: CELL_BORDERS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: '№', bold: true, color: 'FFFFFF', size: 18 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: HEADER_SHADING,
            borders: CELL_BORDERS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Пункт договора', bold: true, color: 'FFFFFF', size: 18 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: HEADER_SHADING,
            borders: CELL_BORDERS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Редакция договора', bold: true, color: 'FFFFFF', size: 18 })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            shading: HEADER_SHADING,
            borders: CELL_BORDERS,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: 'Предлагаемая редакция', bold: true, color: 'FFFFFF', size: 18 })],
              }),
            ],
          }),
        ],
      }),
      // Строки данных
      ...items.map(
        (item) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 5, type: WidthType.PERCENTAGE },
                borders: CELL_BORDERS,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: String(item.number), size: 18 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 15, type: WidthType.PERCENTAGE },
                borders: CELL_BORDERS,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: item.clauseRef || '', bold: true, size: 18 })],
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: item.clauseTitle || '', size: 16, color: '444444', italics: true })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                borders: CELL_BORDERS,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: item.originalText || '', size: 18 })],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.SOLID, color: 'e8f5e9' },
                borders: CELL_BORDERS,
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: item.proposedText || '', size: 18, bold: true })],
                  }),
                ],
              }),
            ],
          })
      ),
    ];

    const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };

    const doc = new Document({
      styles: {
        default: {
          document: { run: { font: 'Times New Roman', size: 24 } },
        },
      },
      sections: [
        {
          properties: {
            page: { margin: { top: 1000, bottom: 1000, left: 1440, right: 720 } },
          },
          children: [
            // Заголовок
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
              children: [new TextRun({ text: 'ПРОТОКОЛ РАЗНОГЛАСИЙ', bold: true, size: 28 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: `к договору: ${analysis.contractTitle || '___________________'}`,
                  size: 22,
                  italics: true,
                }),
              ],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [new TextRun({ text: `от «___» ____________ 20__г. № ___`, size: 22 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 80 },
              children: [new TextRun({ text: `Дата составления: ${analysis.analysisDate}`, size: 22 })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 },
              children: [new TextRun({ text: `Составлен с позиции: ${roleText}а`, size: 22 })],
            }),

            // Стороны
            new Paragraph({
              spacing: { before: 200, after: 100 },
              children: [new TextRun({ text: 'Стороны:', bold: true, size: 22 })],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: NONE,
                bottom: NONE,
                left: NONE,
                right: NONE,
                insideHorizontal: NONE,
                insideVertical: NONE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: 'Заказчик: _______________________', size: 20 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'ИНН/КПП: ________________________', size: 20 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Адрес: __________________________', size: 20 })] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
                      children: [
                        new Paragraph({ children: [new TextRun({ text: 'Подрядчик: ______________________', size: 20 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'ИНН/КПП: ________________________', size: 20 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Адрес: __________________________', size: 20 })] }),
                      ],
                    }),
                  ],
                }),
              ],
            }),

            // Вводный текст
            new Paragraph({
              spacing: { before: 300, after: 200 },
              children: [
                new TextRun({
                  text: 'Настоящий Протокол разногласий составлен в соответствии со ст. 443–445 Гражданского кодекса Российской Федерации. Перечень разногласий:',
                  size: 20,
                }),
              ],
            }),

            // Таблица протокола
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),

            // Подписи
            new Paragraph({
              spacing: { before: 600, after: 200 },
              children: [new TextRun({ text: 'ПОДПИСИ СТОРОН:', bold: true, size: 22 })],
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: NONE,
                bottom: NONE,
                left: NONE,
                right: NONE,
                insideHorizontal: NONE,
                insideVertical: NONE,
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
                      children: [
                        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: 'Заказчик:', bold: true, size: 20 })] }),
                        new Paragraph({ spacing: { after: 500 }, children: [new TextRun({ text: '________________________', size: 20 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'ФИО ___________________', size: 18 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Должность ______________', size: 18 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Дата ___________________', size: 18 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'М.П.', size: 18 })] }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      borders: { top: NONE, bottom: NONE, left: NONE, right: NONE },
                      children: [
                        new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: 'Подрядчик:', bold: true, size: 20 })] }),
                        new Paragraph({ spacing: { after: 500 }, children: [new TextRun({ text: '________________________', size: 20 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'ФИО ___________________', size: 18 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Должность ______________', size: 18 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'Дата ___________________', size: 18 })] }),
                        new Paragraph({ children: [new TextRun({ text: 'М.П.', size: 18 })] }),
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
    return NextResponse.json({ error: `Ошибка: ${message}` }, { status: 500 });
  }
}
