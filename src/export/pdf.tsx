import { Document, Font, Page, Text, View, pdf } from '@react-pdf/renderer'
import type { DocumentModel, DocumentParagraph } from './document-model'

let fontBase = `${import.meta.env.BASE_URL ?? '/'}fonts`
let fontFamily = 'Liberation Serif'
export function configurePdfFonts(base: string) {
  fontBase = base
  fontFamily = `Liberation Serif ${base}`
  Font.register({
    family: fontFamily,
    fonts: [
      { src: `${fontBase}/LiberationSerif-Regular.ttf`, fontWeight: 400 },
      { src: `${fontBase}/LiberationSerif-Bold.ttf`, fontWeight: 700 },
    ],
  })
}
configurePdfFonts(fontBase)
Font.registerHyphenationCallback((word) => [word])

function Paragraph({ item }: { item: DocumentParagraph }) {
  return (
    <Text
      minPresenceAhead={item.keepNext ? 20 : 0}
      style={{
        fontSize: item.size ?? 10,
        fontWeight: item.bold ? 700 : 400,
        textAlign: item.center ? 'center' : 'left',
        marginBottom: item.spaceAfter ?? 6,
        lineHeight: 1.15,
      }}
    >
      {item.text}
    </Text>
  )
}
export function AnnexPdf({ model }: { model: DocumentModel }) {
  return (
    <Document title={model.title} author="Organizador de titulación" language="es-EC">
      <Page
        size={[model.page.width, model.page.height]}
        style={{
          fontFamily,
          fontSize: 10,
          paddingTop: model.page.marginY,
          paddingBottom: Math.max(model.page.marginBottom, 65),
          paddingLeft: model.page.marginX,
          paddingRight: model.page.marginRight,
        }}
      >
        {model.headings.map((item, index) => (
          <Paragraph key={`h${index}`} item={item} />
        ))}
        {model.paragraphs.map((item, index) => (
          <Paragraph key={`p${index}`} item={item} />
        ))}
        {model.rows.length > 0 && (
          <View style={{ width: model.report ? 432.2 : undefined }}>
            <View fixed style={{ flexDirection: 'row', borderWidth: 0.6 }} minPresenceAhead={25}>
              <Text style={{ width: 55.05, padding: 3, fontWeight: 700 }}>Fecha</Text>
              <Text style={{ flex: 1, padding: 3, borderLeftWidth: 0.6, fontWeight: 700 }}>
                Actividad
              </Text>
            </View>
            {model.rows.map((row, index) => (
              <View
                key={index}
                style={{ flexDirection: 'row', borderWidth: 0.6, borderTopWidth: 0 }}
                wrap={row.description.length > 1800}
              >
                <Text style={{ width: 55.05, padding: 3, fontSize: 9 }}>{row.date}</Text>
                <Text style={{ flex: 1, padding: 3, borderLeftWidth: 0.6, lineHeight: 1.2 }}>
                  {row.description}
                </Text>
              </View>
            ))}
          </View>
        )}
        {model.afterTable.map((item, index) => (
          <Paragraph key={`a${index}`} item={item} />
        ))}
        <View wrap={false} style={{ marginTop: 20, marginBottom: 10 }}>
          {model.signature.map((item, index) => (
            <Text
              key={index}
              style={{
                fontSize: item.size ?? 10,
                fontWeight: item.bold ? 700 : 400,
                textAlign: model.report ? 'center' : 'left',
                marginBottom: 2,
              }}
            >
              {item.text}
            </Text>
          ))}
        </View>
        {model.notes.map((note, index) => (
          <Text key={`n${index}`} style={{ fontSize: 9, lineHeight: 1.15, marginBottom: 7 }}>
            {note}
          </Text>
        ))}
        <View
          fixed
          style={{
            position: 'absolute',
            bottom: 28,
            left: model.page.marginX,
            right: model.page.marginRight,
            borderTopWidth: 2,
            borderTopColor: '#6c0000',
            paddingTop: 4,
          }}
        >
          <Text style={{ fontSize: 7 }}>{model.footer}</Text>
          <Text
            style={{ fontSize: 7, textAlign: 'right' }}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  )
}
export async function renderPdf(model: DocumentModel): Promise<Blob> {
  return pdf(<AnnexPdf model={model} />).toBlob()
}
