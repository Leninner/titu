import { describe, expect, it } from 'vitest'
import { catalog } from '../../src/catalog'
import { submissionEntries } from '../../src/domain/submission-entries'
import { emptyWorkspace, type DocumentVersion, type Workspace } from '../../src/domain/types'

const graders = catalog.workflowDefinitions.find((definition) => definition.id === 'calificadores-research')!

function file(id: string, category: string, originalName = `${id}.pdf`, month?: string) {
  return {
    document: { id: `doc-${id}`, name: id, category, createdAt: '' },
    version: {
      id, documentId: `doc-${id}`, blobId: `blob-${id}`, originalName, mime: 'application/pdf',
      size: 1, sha256: '', createdAt: '2026-10-01T00:00:00Z',
      signatureStatus: 'unsigned', textualPdfStatus: 'unknown',
      reportAnalysis: month ? { recognized: true, month } : undefined,
    } satisfies DocumentVersion,
  }
}

function workspaceWith(files: ReturnType<typeof file>[]): Workspace {
  return {
    ...emptyWorkspace(),
    documents: files.map((entry) => entry.document),
    versions: files.map((entry) => entry.version),
  }
}

const monthlies = ['2026-07', '2026-03', '2026-05', '2026-04', '2026-06'].map((month) =>
  file(`m-${month}`, 'mensual', `scan ${month}.pdf`, month))
const required = [
  file('thesis', 'tesis', 'Tesis final v3.pdf'),
  file('request', 'solicitud-calificadores', 'anexo10.pdf'),
  file('id', 'personal', 'CEDULA.PDF'),
  file('company', 'empresa'),
  file('final', 'final'),
  ...monthlies,
  file('endorsement', 'aval-informes'),
  file('similarity', 'similitud'),
  file('resolution', 'resolucion'),
  file('enrollment', 'matricula'),
]

describe('paquete numerado', () => {
  it('nombra la designación de calificadores del Proyecto en el orden establecido', () => {
    const workspace = workspaceWith(required)
    const names = submissionEntries(graders, workspace, required.map((entry) => entry.version.id))
      .map((entry) => entry.name)
    expect(names).toEqual([
      '1. Solicitud calificación del informe final.pdf',
      '2. Copia de cédula y papeleta de votación.PDF',
      '3. Informe de cumplimiento del 100% coordinador empresarial.pdf',
      '4. Informe de cumplimiento del 100 % docente tutor.pdf',
      '5. Informe mensual 1.pdf',
      '6. Informe mensual 2.pdf',
      '7. Informe mensual 3.pdf',
      '8. Informe mensual 4.pdf',
      '9. Informe mensual 5.pdf',
      '10. Aval de informes mensuales e informe final.pdf',
      '11. Informe de un sistema de similitud autorizado por la universidad.pdf',
      '12. Copia de la resolución de aprobación de modalidad y tema.pdf',
      '13. Certificado de folio y matrícula.pdf',
      '14. Trabajo de titulación.pdf',
    ])
  })
  it('ordena los informes mensuales por mes', () => {
    const workspace = workspaceWith(monthlies)
    const entries = submissionEntries(graders, workspace, monthlies.map((entry) => entry.version.id))
    expect(entries.map((entry) => entry.versionId)).toEqual(
      ['m-2026-03', 'm-2026-04', 'm-2026-05', 'm-2026-06', 'm-2026-07'],
    )
  })
  it('numera sin huecos cuando no hay informe empresarial', () => {
    const files = required.filter((entry) => entry.document.category !== 'empresa')
    const names = submissionEntries(graders, workspaceWith(files), files.map((entry) => entry.version.id))
      .map((entry) => entry.name)
    expect(names[2]).toBe('3. Informe de cumplimiento del 100 % docente tutor.pdf')
    expect(names).toHaveLength(13)
  })
  it('conserva el nombre original cuando el requisito no declara uno estándar', () => {
    const files = [file('extra', 'otra', 'mi archivo.pdf'), file('thesis', 'tesis')]
    const definition = { ...graders, requirements: [{ id: 'tesis', label: 'Tesis', category: 'tesis' }] }
    const names = submissionEntries(definition, workspaceWith(files), ['extra', 'thesis'])
      .map((entry) => entry.name)
    expect(names).toEqual(['1. thesis.pdf', '2. mi archivo.pdf'])
  })
})
