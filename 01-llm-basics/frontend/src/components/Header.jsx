// Top bar: which provider/model the backend is using, and whether it is reachable
export default function Header({ info, online }) {
  const status = online === null ? ['', 'connecting'] : online ? ['ok', 'connected'] : ['err', 'backend offline']

  return (
    <header className="topbar">
      <div className="brand">
        <span className="logo">◆</span>
        <h1>LLM Playground</h1>
      </div>
      <div className="badges">
        <span className="badge">provider: {info?.provider ?? '…'}</span>
        <span className="badge">model: {info?.model ?? '…'}</span>
        <span className={`status ${status[0]}`}>
          <i />
          {status[1]}
        </span>
      </div>
    </header>
  )
}
