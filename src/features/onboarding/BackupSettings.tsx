import { BackupImport } from '../settings/BackupImport'

export function BackupSettings() {
  return (
    <section className="settings-section">
      <h2>Respaldo y recuperación</h2>
      <p>
        El respaldo contiene tus datos personales y todos tus archivos. Guárdalo en un lugar seguro;
        no está cifrado.
      </p>
      <BackupImport />
    </section>
  )
}
