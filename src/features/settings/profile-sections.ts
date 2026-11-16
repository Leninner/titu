import { modalityLabels, type StudentProfile } from '../../domain/types'

export interface ProfileField {
  key: keyof StudentProfile
  label: string
  input: 'text' | 'email' | 'date' | 'select' | 'checkbox'
  options?: Record<string, string>
  wide?: boolean
  when?: (profile: StudentProfile) => boolean
}

export interface ProfileSection {
  id: string
  title: string
  description: string
  fields: ProfileField[]
  hint?: string
}

const periodLabels: Record<string, string> = {
  '2026-07-12': 'Julio – diciembre 2026',
  other: 'Otro período',
}

const worksInCompany = (profile: StudentProfile) => profile.aplicaEmpresa

const companyField = (key: keyof StudentProfile, label: string, input: ProfileField['input'] = 'text'): ProfileField => ({
  key,
  label,
  input,
  when: worksInCompany,
})

export const profileSections: ProfileSection[] = [
  {
    id: 'personal',
    title: 'Datos personales',
    description: 'Aparecen en los anexos y en tus correos.',
    fields: [
      { key: 'nombres', label: 'Nombres y apellidos', input: 'text', wide: true },
      { key: 'cedula', label: 'Cédula', input: 'text' },
      { key: 'email', label: 'Correo', input: 'email' },
      { key: 'direccion', label: 'Dirección', input: 'text', wide: true },
    ],
  },
  {
    id: 'titulacion',
    title: 'Titulación',
    description: 'Definen tus trámites, fechas y anexos.',
    fields: [
      { key: 'modalidad', label: 'Modalidad', input: 'select', options: modalityLabels },
      { key: 'periodo', label: 'Período', input: 'select', options: periodLabels },
      { key: 'facultad', label: 'Facultad', input: 'text', wide: true },
      { key: 'carrera', label: 'Carrera', input: 'text' },
      { key: 'titulo', label: 'Título a obtener', input: 'text' },
      { key: 'tema', label: 'Tema aprobado', input: 'text', wide: true },
      { key: 'aprobacionFecha', label: 'Fecha de aprobación', input: 'date' },
      { key: 'aprobacionResolucion', label: 'Resolución de aprobación o cambio', input: 'text' },
      { key: 'tutor', label: 'Tutor', input: 'text' },
    ],
    hint: 'Cambiar de modalidad o período conserva tus archivos y envíos. Revisa los borradores afectados antes de exportarlos.',
  },
  {
    id: 'empresa',
    title: 'Empresa',
    description: 'Datos de la empresa o institución donde realizas el trabajo.',
    fields: [
      { key: 'aplicaEmpresa', label: 'El trabajo se realiza en una empresa', input: 'checkbox', wide: true },
      companyField('empresa', 'Empresa o institución'),
      companyField('representante', 'Representante'),
      companyField('cargoRepresentante', 'Cargo del representante'),
      companyField('cedulaRepresentante', 'Cédula del representante'),
      companyField('emailRepresentante', 'Correo del representante', 'email'),
      companyField('telefonoRepresentante', 'Teléfono convencional del representante'),
      companyField('celularRepresentante', 'Celular del representante'),
    ],
  },
]

export const visibleFields = (section: ProfileSection, profile: StudentProfile) =>
  section.fields.filter((field) => field.when?.(profile) ?? true)

export const missingCount = (section: ProfileSection, profile: StudentProfile) =>
  visibleFields(section, profile).filter(
    (field) => field.input !== 'checkbox' && !String(profile[field.key]).trim(),
  ).length

const longDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat('es-EC', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(year, month - 1, day)),
  )
}

export function displayValue(field: ProfileField, profile: StudentProfile) {
  const value = profile[field.key]
  if (field.input === 'checkbox') return value ? 'Sí' : 'No'
  const text = String(value).trim()
  if (!text) return ''
  if (field.input === 'select') return field.options?.[text] ?? text
  return field.input === 'date' ? longDate(text) : text
}

export const sectionValues = (section: ProfileSection, profile: StudentProfile) =>
  Object.fromEntries(section.fields.map((field) => [field.key, profile[field.key]])) as Partial<StudentProfile>
