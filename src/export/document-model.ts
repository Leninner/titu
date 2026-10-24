import type { AnnexDraft } from '../domain/types'
import { modalityLabels } from '../domain/types'
import { getTemplateLayout } from './template-registry'

export interface DocumentParagraph {
  text: string
  bold?: boolean
  center?: boolean
  size?: number
  keepNext?: boolean
  spaceAfter?: number
}
export interface DocumentModel {
  title: string
  page: {
    width: number
    height: number
    marginX: number
    marginY: number
    marginRight: number
    marginBottom: number
  }
  headings: DocumentParagraph[]
  paragraphs: DocumentParagraph[]
  rows: { date: string; description: string }[]
  afterTable: DocumentParagraph[]
  signature: DocumentParagraph[]
  notes: string[]
  report: boolean
  footer: string
}
export function buildDocumentModel(input: AnnexDraft): DocumentModel {
  const draft = structuredClone(input)
  const layout = getTemplateLayout(draft.templateId)
  const profile = draft.profileSnapshot
  const values: Record<string, string> = {
    ...draft.fields,
    ...Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, String(value)])),
    modalidad: modalityLabels[profile.modalidad],
  }
  const substitute = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] || '')
  const paragraph = (text: string, bold = false): DocumentParagraph => ({
    text,
    bold,
    size: layout.report ? 10 : 12,
    spaceAfter: layout.report ? 11 : 6,
  })
  const model: DocumentModel = {
    title: layout.template.name,
    page: layout.geometry,
    report: layout.report,
    headings: layout.headings.map((text) => ({
      text,
      bold: true,
      center: true,
      size: 12,
      keepNext: true,
    })),
    paragraphs: [],
    rows: [],
    afterTable: [],
    signature: [],
    notes: layout.notes,
    footer:
      'INSTRUCTIVO DEL REGLAMENTO PARA LA TITULACIÓN DE GRADO EN LA UNIVERSIDAD TÉCNICA DE AMBATO',
  }
  if (layout.report) {
    model.headings.push(
      ...[
        'UNIVERSIDAD TÉCNICA DE AMBATO',
        profile.facultad.toUpperCase(),
        `CARRERA DE ${profile.carrera.toUpperCase()}`,
      ].map((text) => ({ text, bold: true, center: true, size: 12, keepNext: true })),
    )
    model.headings[0].spaceAfter = 12
    model.headings[1].spaceAfter = 36
    model.headings[model.headings.length - 1].spaceAfter = 24
    model.paragraphs = [
      paragraph(`FECHA: ${values.fecha}`, true),
      paragraph(`NOMBRE DEL ESTUDIANTE: ${profile.nombres}`, true),
      paragraph(`MODALIDAD DE TITULACIÓN: ${values.modalidad}`, true),
      paragraph(`TEMA DEL TRABAJO DE TITULACIÓN: ${values.tema}`, true),
      paragraph(
        `${draft.templateId === 'anexo-5' ? 'FECHA DE APROBACIÓN DE LA PROPUESTA DEL PERFIL DEL TRABAJO DE TITULACIÓN POR EL CONSEJO DIRECTIVO' : 'FECHA DE APROBACIÓN DE LA PROPUESTA EN CONSEJO DIRECTIVO'}: ${profile.aprobacionFecha}`,
        true,
      ),
      paragraph(
        `PORCENTAJE ${draft.templateId === 'anexo-11' ? 'FINAL ' : ''}DE AVANCE DE ACUERDO AL CRONOGRAMA: ${values.avance}%`,
        true,
      ),
    ]
    model.rows = draft.activities.map((activity) => ({
      date: activity.date,
      description: activity.description,
    }))
    if (draft.templateId === 'anexo-5')
      model.afterTable = [
        paragraph(
          `OBSERVACIONES: ${values.observaciones || '\n................................................................................................................\n................................................................................................................'}`,
        ),
      ]
    model.signature = [
      paragraph('_________________________________________'),
      paragraph(profile.tutor, true),
      paragraph('NOMBRE Y FIRMA'),
      paragraph('TUTOR TRABAJO TITULACIÓN', true),
    ]
  } else {
    model.paragraphs = [
      paragraph(`${values.lugar}, ${values.fecha}`),
      paragraph(values.destinatario),
      paragraph(layout.recipientRole),
      paragraph(profile.facultad),
      paragraph('Presente. -'),
      paragraph('De mi consideración:'),
      ...layout.body.map((text) => paragraph(substitute(text))),
    ]
    if (draft.templateId === 'anexo-1' && profile.modalidad === 'complexivo')
      model.paragraphs = model.paragraphs.filter((item) => !item.text.startsWith('PROPUESTA'))
    if (!layout.template.companyOnly)
      model.paragraphs.push(
        paragraph('Por la favorable atención que se dé al presente, agradezco y suscribo.'),
      )
    const company = layout.template.companyOnly
    model.signature = [
      paragraph('Atentamente'),
      paragraph('_________________________________________'),
      paragraph(company ? values.representante : profile.nombres),
      paragraph(company ? values.cargoRepresentante : `Cédula de Ciudadanía: ${profile.cedula}`),
    ]
    if (company)
      model.signature.push(paragraph(`Cédula de Ciudadanía: ${values.cedulaRepresentante}`))
    model.signature.push(
      paragraph(`No teléfono convencional: ${values.telefono || ''}`),
      paragraph(`No teléfono celular: ${values.celular || ''}`),
      paragraph(`Correo electrónico: ${company ? values.emailRepresentante : profile.email}`),
    )
    if (draft.templateId.startsWith('anexo-14'))
      model.signature.push(paragraph(`Dirección: ${profile.direccion}`))
    if (draft.templateId === 'anexo-1' && profile.modalidad !== 'complexivo')
      model.signature.push(paragraph(`Tutor sugerido (nombre y firma): ${profile.tutor}`))
  }
  return model
}
