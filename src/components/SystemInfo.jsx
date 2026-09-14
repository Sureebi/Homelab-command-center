import {
  Server,
  CircleCheck,
  Network,
  Cpu,
  Clock3,
  ArrowDown,
  ArrowUp,
} from 'lucide-react'

export default function SystemInfo({ system, online, formatUptime }) {
  const loadMax = system?.cpu_cores || 4

  const loadItems = [
    { label: '1 MIN', value: system?.load_1 ?? 0 },
    { label: '5 MIN', value: system?.load_5 ?? 0 },
    { label: '15 MIN', value: system?.load_15 ?? 0 },
  ]

  const formatSpeed = (bytes = 0) => {
    if (!bytes || bytes <= 0) return '0 KB/s'

    const kb = bytes / 1024

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB/s`
    }

    const mb = kb / 1024

    if (mb < 1024) {
      return `${mb.toFixed(1)} MB/s`
    }

    return `${(mb / 1024).toFixed(2)} GB/s`
  }

  return (
    <section className="panel system-info-panel">

      <div className="panel-header">
        <div>
          <span className="panel-label">SYSTEM</span>
          <h2>Server Information</h2>
        </div>

        <Server />
      </div>

      <div className="system-hero">
        <div>
          <span className="system-hero-label">HOST</span>
          <strong>{system?.hostname || 'Sureepi'}</strong>
          <p>Raspberry Pi 5 · {system?.architecture || '--'}</p>
        </div>

        <div className={`system-health ${online ? '' : 'offline'}`}>
          <CircleCheck size={14} />
          {online ? 'OPERATIONAL' : 'OFFLINE'}
        </div>
      </div>

      <div className="system-details-grid">

        <div className="system-detail-group">
          <div className="system-group-title">
            <Cpu size={14} />
            <span>SYSTEM</span>
          </div>

          <SystemRow label="OS" value={system?.os || '--'} />
          <SystemRow label="KERNEL" value={system?.kernel || '--'} />
          <SystemRow label="CORES" value={system?.cpu_cores ?? '--'} />
        </div>

        <div className="system-detail-group">
          <div className="system-group-title">
            <Network size={14} />
            <span>NETWORK</span>
          </div>

          <SystemRow label="IP" value={system?.ip || '--'} />

          <SystemRow
            label="UPTIME"
            value={formatUptime(system?.uptime)}
          />

          <SystemRow
            label={
              <span className="network-row-label">
                <ArrowDown size={11} />
                DOWNLOAD
              </span>
            }
            value={formatSpeed(system?.download_bytes_sec)}
          />

          <SystemRow
            label={
              <span className="network-row-label">
                <ArrowUp size={11} />
                UPLOAD
              </span>
            }
            value={formatSpeed(system?.upload_bytes_sec)}
          />
        </div>

      </div>

      <div className="system-load">

        <div className="system-load-header">
          <div className="system-group-title">
            <Clock3 size={14} />
            <span>SYSTEM LOAD</span>
          </div>

          <span>LIVE</span>
        </div>

        <div className="load-grid">

          {loadItems.map((item) => (
            <div className="load-item" key={item.label}>

              <span>{item.label}</span>

              <strong>
                {Number(item.value).toFixed(2)}
              </strong>

              <div className="load-track">
                <div
                  style={{
                    width: `${Math.min(
                      (item.value / loadMax) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>

            </div>
          ))}

        </div>

      </div>

    </section>
  )
}

function SystemRow({ label, value }) {
  return (
    <div className="system-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}