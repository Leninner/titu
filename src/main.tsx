import React from 'react'
import { createRoot } from 'react-dom/client'
import { AppShell } from './app/AppShell'
import { WorkspaceProvider } from './app/WorkspaceContext'
import './styles/tokens.css'
import './styles/file-cards.css'
import './styles/process-map.css'
import './styles/task-steps.css'
import './styles/tailwind.generated.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  </React.StrictMode>,
)
