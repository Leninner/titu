import type { AnnexDraft } from '../domain/types'
import { modalityLabels } from '../domain/types'
import { letterDate } from '../domain/dates'
import { getTemplateLayout } from './template-registry'

export interface DocumentParagraph {
  text: string
  bold?: boolean
  align?: 'left' | 'center' | 'right'
  size?: number
  keepNext?: boolean
  spaceBefore?: number
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
  guidance: string[]
  report: boolean
  footer: string
}
const signatureSpace = 85
const blockGap = 24
const paragraphGap = 12

const companySigner = (values: Record<string, string>, templateId: string) => [
  values.representante,
  values.cargoRepresentante,
  `Cédula de Ciudadanía: ${values.cedulaRepresentante}`,
  `No teléfono convencional: ${values.telefonoRepresentante}`,
  `No teléfono celular: ${values.celularRepresentante}`,
  `${templateId === 'anexo-3' ? 'Correo electrónico institucional' : 'Correo electrónico'}: ${values.emailRepresentante}`,
]

const institutionalEmail = new Set(['anexo-14-research', 'anexo-14-article'])

const studentSigner = (values: Record<string, string>, templateId: string) => [
  values.nombres,
  `Cédula de Ciudadanía: ${values.cedula}`,
  `No teléfono convencional: ${values.telefono || ''}`,
  `No teléfono celular: ${values.celular || ''}`,
  ...(templateId.startsWith('anexo-14') ? [`Dirección: ${values.direccion}`] : []),
  `${institutionalEmail.has(templateId) ? 'Correo electrónico institucional' : 'Correo electrónico'}: ${values.email}`,
]

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
  const signatureLine = (): DocumentParagraph => ({
    ...paragraph('_'.repeat(55)),
    spaceBefore: signatureSpace,
  })
  const model: DocumentModel = {
    title: layout.template.name,
    page: layout.geometry,
    report: layout.report,
    headings: layout.headings.map((text) => ({
      text,
      bold: true,
      align: 'center',
      size: 12,
      keepNext: true,
    })),
    paragraphs: [],
    rows: [],
    afterTable: [],
    signature: [],
    guidance: layout.notes,
    footer:
      'INSTRUCTIVO DEL REGLAMENTO PARA LA TITULACIÓN DE GRADO EN LA UNIVERSIDAD TÉCNICA DE AMBATO',
  }
  if (layout.report) {
    model.headings.push(
      ...[
        'UNIVERSIDAD TÉCNICA DE AMBATO',
        profile.facultad.toUpperCase(),
        `CARRERA DE ${profile.carrera.toUpperCase()}`,
      ].map((text) => ({ text, bold: true, align: 'center' as const, size: 12, keepNext: true })),
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
      signatureLine(),
      paragraph(profile.tutor, true),
      paragraph('TUTOR TRABAJO TITULACIÓN', true),
    ].map((item) => ({ ...item, align: 'center' as const }))
  } else {
    const spaced = (text: string, spaceAfter: number) => ({ ...paragraph(text), spaceAfter })
    const company = !!layout.template.companyOnly
    const recipient = [
      values.destinatario,
      layout.recipientRole,
      ...(company ? [`Carrera de ${profile.carrera}`] : []),
      profile.facultad,
      ...(draft.templateId === 'anexo-3' ? [] : ['Presente. -']),
    ].map((text, index, lines) => spaced(text, index === lines.length - 1 ? blockGap : 0))
    model.paragraphs = [
      { ...spaced(`${values.lugar}, ${letterDate(values.fecha ?? '')}`, blockGap), align: 'right' },
      ...recipient,
      ...(company ? [] : [spaced('De mi consideración:', paragraphGap)]),
      ...layout.body.map((text) => spaced(substitute(text), paragraphGap)),
    ]
    if (draft.templateId === 'anexo-1' && profile.modalidad === 'complexivo')
      model.paragraphs = model.paragraphs.filter((item) => !item.text.startsWith('PROPUESTA'))
    if (!company)
      model.paragraphs.push(
        spaced('Por la favorable atención que se dé al presente, agradezco y suscribo.', paragraphGap),
      )
    model.signature = [
      paragraph('Atentamente'),
      signatureLine(),
      ...(company ? companySigner(values, draft.templateId) : studentSigner(values, draft.templateId)).map((text) =>
        paragraph(text),
      ),
    ]
    if (draft.templateId === 'anexo-1' && profile.modalidad !== 'complexivo')
      model.signature.push(paragraph(`Tutor sugerido (nombre y firma): ${profile.tutor}`))
  }
  return model
}
