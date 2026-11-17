import type { ComponentType } from 'react'
import type { InformationalStatus } from '../../domain/informational'
import type { WorkflowDefinition } from '../../domain/types'
import { GraderTimeline } from './GraderTimeline'
import { GradingBoard } from './GradingBoard'

interface BoardProps {
  definition: WorkflowDefinition
  status: InformationalStatus
}

function GraderBoard({ definition, status }: BoardProps) {
  return (
    <div className="grader-board">
      <GraderTimeline />
      <GradingBoard definition={definition} status={status} />
    </div>
  )
}

const informationalBoards: Record<string, ComponentType<BoardProps>> = {
  calificacion: GraderBoard,
}

export function InformationalBoard({ definition, status }: BoardProps) {
  const Board = informationalBoards[definition.id]
  return Board ? <Board definition={definition} status={status} /> : null
}
