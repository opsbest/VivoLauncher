import './UpdatePanel.css'

export default function UpdatePanel({ title, children }) {
  return (
    <div className="update-panel pixel-panel">
      <h1 className="text-header">{title}</h1>
      <p className="text-body text-muted">{children}</p>
    </div>
  )
}
