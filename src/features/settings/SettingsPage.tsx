import { useState } from 'react'
import { Archive, UserRound } from 'lucide-react'
import { Tabs, tabId, tabPanelId, type TabItem } from '../../components/Tabs'
import { BackupPanel } from './BackupPanel'
import { ProfileCard } from './ProfileCard'
import { profileSections } from './profile-sections'
import './settings.css'

type SettingsTab = 'expediente' | 'respaldo'

const tabs: TabItem<SettingsTab>[] = [
  { id: 'expediente', label: 'Expediente', icon: <UserRound size={16} aria-hidden="true" /> },
  { id: 'respaldo', label: 'Respaldo', icon: <Archive size={16} aria-hidden="true" /> },
]

export function SettingsPage() {
  const [active, setActive] = useState<SettingsTab>('expediente')
  return (
    <div className="page settings-page">
      <h1>Tu expediente</h1>
      <p className="lead">Revisa tus datos y guarda respaldos de tu expediente.</p>
      <Tabs scope="settings" label="Secciones de ajustes" tabs={tabs} active={active} onSelect={setActive} />
      <div
        className="settings-panel"
        role="tabpanel"
        id={tabPanelId('settings', active)}
        aria-labelledby={tabId('settings', active)}
      >
        {active === 'expediente'
          ? profileSections.map((section) => <ProfileCard key={section.id} section={section} />)
          : <BackupPanel />}
      </div>
    </div>
  )
}
