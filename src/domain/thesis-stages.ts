export const thesisCategories = [
  'tesis',
  'tesis-corregido',
  'tesis-firma-estudiante',
  'tesis-firmas-docentes',
  'tesis-decanato',
]

export const isThesisCategory = (category?: string) => !!category && thesisCategories.includes(category)
