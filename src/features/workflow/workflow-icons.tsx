import {
  CalendarClock,
  CalendarRange,
  CircleCheck,
  CircleDot,
  FileText,
  Flag,
  GraduationCap,
  Hourglass,
  Landmark,
  Library,
  Lightbulb,
  Lock,
  NotebookPen,
  Presentation,
  ScrollText,
  ShieldCheck,
  User,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { NodeStatus } from '../../domain/process-map'
import type { CalendarEvent } from '../../domain/types'

export const statusIcons: Record<NodeStatus, LucideIcon> = {
  done: CircleCheck,
  waiting: Hourglass,
  active: CircleDot,
  blocked: Lock,
}

export const statusText: Record<NodeStatus, string> = {
  done: 'Completado',
  waiting: 'En trámite',
  active: 'Disponible',
  blocked: 'Bloqueado',
}

const stageIcons: Record<string, LucideIcon> = {
  propuesta: Lightbulb,
  desarrollo: NotebookPen,
  calificadores: Users,
  complexivo: ScrollText,
  aptitud: ShieldCheck,
  biblioteca: Library,
  sustentacion: Presentation,
  titulo: GraduationCap,
}

export function StageIcon({ stage, size }: { stage: string; size: number }) {
  const Icon = stageIcons[stage] ?? FileText
  return <Icon size={size} aria-hidden="true" />
}

export const eventIcons: Record<CalendarEvent['kind'], LucideIcon> = {
  deadline: Flag,
  window: CalendarRange,
  administrative: Landmark,
  appointment: CalendarClock,
  personal: User,
}
