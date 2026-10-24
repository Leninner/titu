import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import type { DocumentModel, DocumentParagraph } from './document-model'

const alignments = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
}

function paragraph(item: DocumentParagraph, signature = false) {
  return new Paragraph({
    alignment: alignments[item.align ?? 'left'],
    keepNext: signature || item.keepNext,
    spacing: {
      before: (item.spaceBefore ?? 0) * 20,
      after: signature ? 20 : (item.spaceAfter ?? 6) * 20,
      line: 240,
    },
    children: item.text
      .split('\n')
      .flatMap((text, index) => [
        new TextRun({ text, break: index ? 1 : 0, bold: item.bold, size: (item.size ?? 10) * 2 }),
      ]),
  })
}
export async function renderDocx(model: DocumentModel): Promise<Blob> {
  const content = [...model.headings, ...model.paragraphs].map((item) => paragraph(item))
  const children: (Paragraph | Table)[] = [...content]
  if (model.rows.length) {
    const width = model.report
      ? 8644
      : Math.round((model.page.width - model.page.marginX - model.page.marginRight) * 20)
    const firstWidth = 1101
    const rows = [{ date: 'Fecha', description: 'Actividad' }, ...model.rows]
    children.push(
      new Table({
        width: { size: width, type: WidthType.DXA },
        columnWidths: [firstWidth, width - firstWidth],
        layout: TableLayoutType.FIXED,
        rows: rows.map(
          (row, index) =>
            new TableRow({
              tableHeader: index === 0,
              children: [row.date, row.description].map(
                (text, column) =>
                  new TableCell({
                    width: { size: column ? width - firstWidth : firstWidth, type: WidthType.DXA },
                    margins: { top: 60, bottom: 60, left: 70, right: 70 },
                    children: [
                      new Paragraph({
                        spacing: { after: 0 },
                        children: [new TextRun({ text, bold: index === 0, size: 20 })],
                      }),
                    ],
                  }),
              ),
            }),
        ),
      }),
    )
  }
  children.push(...model.afterTable.map((item) => paragraph(item)))
  children.push(
    ...model.signature.map((item, index) =>
      paragraph(item, index < model.signature.length - 1),
    ),
  )
  const doc = new Document({
    title: model.title,
    creator: 'Organizador de titulación',
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 20 },
          paragraph: { spacing: { line: 240 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: Math.round(model.page.width * 20),
              height: Math.round(model.page.height * 20),
            },
            margin: {
              top: Math.round(model.page.marginY * 20),
              bottom: Math.round(Math.max(model.page.marginBottom, 65) * 20),
              left: Math.round(model.page.marginX * 20),
              right: Math.round(model.page.marginRight * 20),
              footer: 500,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 14, color: '6C0000' } },
                children: [new TextRun({ text: model.footer, size: 14 })],
              }),
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES],
                    size: 14,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  })
  return Packer.toBlob(doc)
}
