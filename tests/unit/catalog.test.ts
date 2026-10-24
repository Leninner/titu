import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { catalog, sources } from '../../src/catalog'

describe('institutional catalog', () => {
  it('has 16 distinct editable variants and resolvable source extracts', () => {
    expect(catalog.templates.filter((template) => template.kind === 'editable')).toHaveLength(16)
    for (const list of [
      catalog.templates,
      catalog.workflowDefinitions,
      catalog.calendarEvents,
      sources,
    ])
      expect(new Set(list.map((item) => item.id)).size).toBe(list.length)
    for (const item of [
      ...catalog.templates,
      ...catalog.workflowDefinitions,
      ...catalog.calendarEvents,
    ]) {
      for (const id of item.sourceIds) expect(sources.some((source) => source.id === id)).toBe(true)
    }
    for (const source of sources) expect(existsSync(`public${source.excerptUrl}`)).toBe(true)
    for (const task of catalog.workflowDefinitions)
      for (const dependency of task.dependsOn)
        expect(catalog.workflowDefinitions.some((item) => item.id === dependency)).toBe(true)
  })
  it('keeps actual source text and separates responsible roles', () => {
    for (const template of catalog.templates.filter((template) => template.kind === 'editable'))
      expect(template.fixedText.length).toBeGreaterThan(400)
    expect(catalog.templates.find((template) => template.id === 'anexo-5')?.page).toMatchObject({
      width: 612,
      height: 792,
      marginX: 85.05,
      marginY: 70.85,
    })
    expect(catalog.templates.find((template) => template.id === 'anexo-15')?.name).toContain(
      'Solicitud',
    )
    expect(catalog.templates.find((template) => template.id === 'anexo-13b')?.kind).toBe('missing')
    expect(catalog.templates.find((template) => template.id === 'anexo-12')?.kind).toBe('reference')
    expect(catalog.conflicts).toHaveLength(8)
  })
  it('merges reception-only workflows into the request that produces their result', () => {
    const byId = (id: string) => catalog.workflowDefinitions.find((item) => item.id === id)
    for (const id of ['aprobacion', 'notas', 'biblioteca-aval-inicial', 'biblioteca-aval-final'])
      expect(byId(id)).toBeUndefined()
    const outputs = (id: string) => byId(id)!.outputs.map((output) => output.category ?? output.id)
    expect(outputs('propuesta')).toEqual(['resolucion', 'respuesta'])
    expect(outputs('calificadores-research')).toEqual([
      'resolucion-designacion', 'notas', 'grade-1', 'grade-2', 'respuesta',
    ])
    expect(outputs('biblioteca-revision')).toEqual(['aval-inicial', 'respuesta'])
    expect(outputs('biblioteca-decanato')).toEqual(['biblioteca', 'respuesta'])
    expect(outputs('cambio-tutor')).toEqual(['resolucion-tramite', 'respuesta'])
    expect(byId('desarrollo')!.dependsOn).toEqual(['propuesta'])
    expect(byId('complexivo')!.dependsOn).toEqual(['propuesta'])
    expect(byId('aptitud-legal-article')!.dependsOn).toContain('calificadores-article')
    expect(byId('biblioteca-firma-estudiante')!.dependsOn).toEqual(['biblioteca-revision'])
    expect(byId('dia-hora')!.dependsOn).toContain('biblioteca-decanato')
    expect(byId('dia-hora')!.requirements.map((item) => item.category)).toEqual(
      expect.arrayContaining(['resolucion', 'resolucion-designacion']),
    )
    for (const definition of catalog.workflowDefinitions) {
      const responses = definition.outputs.filter((output) => output.category === 'respuesta')
      expect(responses).toEqual([expect.objectContaining({ optional: true, signed: false })])
    }
  })
  it('describes each workflow by its facts, without instructions for using the app', () => {
    for (const definition of catalog.workflowDefinitions)
      expect(definition.instructions).not.toMatch(
        /aplicaci[oó]n|\bapp\b|marcar|registrar|subir|arrastr|adjunta|selecciona/i,
      )
  })
})
