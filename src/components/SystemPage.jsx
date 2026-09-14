import {
  Server,
  CircleCheck,
  Cpu,
  MemoryStick,
  Thermometer,
  Network,
  ArrowDown,
  ArrowUp,
  Clock3,
  Terminal,
} from 'lucide-react'

export default function SystemPage({
  system,
  online,
  formatUptime,
}) {
  const hostname =
    system?.hostname || 'Sureepi'

  const cpu =
    Number(system?.cpu || 0)

  const ram =
    Number(system?.ram || 0)

  const temperature =
    Number(system?.temperature || 0)

  const loadMax =
    Number(system?.cpu_cores || 4)

  const formatSpeed = (bytes = 0) => {
    if (!bytes || bytes <= 0) {
      return '0 KB/s'
    }

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

  const loadItems = [
    {
      label: '1 MIN',
      value: system?.load_1 ?? 0,
    },
    {
      label: '5 MIN',
      value: system?.load_5 ?? 0,
    },
    {
      label: '15 MIN',
      value: system?.load_15 ?? 0,
    },
  ]

  const ascii = String.raw`
   ███████╗██╗   ██╗██████╗ ███████╗███████╗██████╗ ██╗
   ██╔════╝██║   ██║██╔══██╗██╔════╝██╔════╝██╔══██╗██║
   ███████╗██║   ██║██████╔╝█████╗  █████╗  ██████╔╝██║
   ╚════██║██║   ██║██╔══██╗██╔══╝  ██╔══╝  ██╔═══╝ ██║
   ███████║╚██████╔╝██║  ██║███████╗███████╗██║     ██║
   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝
`

  return (
    <div className="system-page">

      <section className="system-page-hero">

        <div>
          <span className="system-page-kicker">
            SYSTEM / NODE CONSOLE
          </span>

          <h1>
            Neofetch
          </h1>

          <p>
            Runtime identity, operating environment
            and live node telemetry.
          </p>
        </div>

        <div
          className={`system-page-state ${
            online ? '' : 'offline'
          }`}
        >
          <CircleCheck size={15} />

          <div>
            <span>NODE STATE</span>

            <strong>
              {online
                ? 'OPERATIONAL'
                : 'OFFLINE'}
            </strong>
          </div>
        </div>

      </section>


      <section className="neofetch-panel">

        <div className="neofetch-topbar">

          <div className="neofetch-terminal-title">
            <Terminal size={15} />

            <span>
              sureepi@{hostname}
            </span>
          </div>

          <span className="neofetch-session">
            SESSION / LOCAL
          </span>

        </div>


        <div className="neofetch-main">

          <div
            className="neofetch-ascii"
            aria-hidden="true"
          >
            <pre>
              {ascii}
            </pre>

            <span className="neofetch-ascii-caption">
              RASPBERRY PI 5 / CONTROL NODE
            </span>
          </div>


          <div className="neofetch-info">

            <div className="neofetch-user">
              <strong>
                sureepi@{hostname}
              </strong>

              <span>
                ─────────────────────────────
              </span>
            </div>


            <NeoRow
              label="OS"
              value={system?.os || '--'}
            />

            <NeoRow
              label="Host"
              value="Raspberry Pi 5"
            />

            <NeoRow
              label="Kernel"
              value={system?.kernel || '--'}
            />

            <NeoRow
              label="Architecture"
              value={system?.architecture || '--'}
            />

            <NeoRow
              label="Uptime"
              value={
                formatUptime(
                  system?.uptime
                )
              }
            />

            <NeoRow
              label="CPU Cores"
              value={
                system?.cpu_cores ?? '--'
              }
            />

            <NeoRow
              label="IP"
              value={system?.ip || '--'}
            />

            <NeoRow
              label={
                <span className="neo-inline-label">
                  <ArrowDown size={12} />
                  Download
                </span>
              }
              value={
                formatSpeed(
                  system?.download_bytes_sec
                )
              }
            />

            <NeoRow
              label={
                <span className="neo-inline-label">
                  <ArrowUp size={12} />
                  Upload
                </span>
              }
              value={
                formatSpeed(
                  system?.upload_bytes_sec
                )
              }
            />

            <NeoRow
              label="Status"
              value={
                online
                  ? '● OPERATIONAL'
                  : '● OFFLINE'
              }
              accent={online}
              danger={!online}
            />

          </div>

        </div>


        <div className="neofetch-live-grid">

          <NeoMetric
            icon={Cpu}
            label="CPU"
            value={`${cpu.toFixed(1)}%`}
            percent={cpu}
          />

          <NeoMetric
            icon={MemoryStick}
            label="RAM"
            value={`${ram.toFixed(1)}%`}
            percent={ram}
          />

          <NeoMetric
            icon={Thermometer}
            label="TEMP"
            value={`${temperature.toFixed(0)}°C`}
            percent={
              Math.min(
                (temperature / 85) * 100,
                100
              )
            }
          />

          <NeoMetric
            icon={Clock3}
            label="UPTIME"
            value={
              formatUptime(
                system?.uptime
              )
            }
            percent={Math.min(
              ((system?.uptime || 0) /
                86400) * 100,
              100
            )}
          />

        </div>


        <div className="neofetch-load">

          <div className="neofetch-load-title">

            <div>
              <Server size={14} />
              <span>
                SYSTEM LOAD
              </span>
            </div>

            <span>
              LIVE
            </span>

          </div>


          <div className="neofetch-load-grid">

            {loadItems.map((item) => {

              const numeric =
                Number(item.value || 0)

              const width =
                Math.min(
                  (numeric / loadMax) * 100,
                  100
                )

              return (
                <div
                  className="neofetch-load-item"
                  key={item.label}
                >
                  <span>
                    {item.label}
                  </span>

                  <strong>
                    {numeric.toFixed(2)}
                  </strong>

                  <div className="neofetch-progress">
                    <div
                      style={{
                        width: `${width}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}

          </div>

        </div>


        <div className="neofetch-prompt">
          <span>
            sureepi@{hostname}
          </span>

          <strong>
            :~$
          </strong>

          <span>
            node state:
          </span>

          <em>
            {online
              ? 'operational'
              : 'offline'}
          </em>

          <i />

        </div>

      </section>


      <section className="system-mini-panels">

        <div className="system-mini-panel">
          <Network size={17} />

          <div>
            <span>
              NETWORK
            </span>

            <strong>
              {system?.ip || '--'}
            </strong>

            <small>
              LAN interface
            </small>
          </div>
        </div>


        <div className="system-mini-panel">
          <Cpu size={17} />

          <div>
            <span>
              PROCESSOR
            </span>

            <strong>
              {system?.cpu_cores ?? '--'} cores
            </strong>

            <small>
              Raspberry Pi 5
            </small>
          </div>
        </div>


        <div className="system-mini-panel">
          <Clock3 size={17} />

          <div>
            <span>
              RUNTIME
            </span>

            <strong>
              {formatUptime(
                system?.uptime
              )}
            </strong>

            <small>
              Current session
            </small>
          </div>
        </div>

      </section>

    </div>
  )
}


function NeoRow({
  label,
  value,
  accent = false,
  danger = false,
}) {
  return (
    <div className="neofetch-row">

      <span>
        {label}
      </span>

      <strong
        className={`
          ${accent ? 'accent' : ''}
          ${danger ? 'danger' : ''}
        `}
      >
        {value}
      </strong>

    </div>
  )
}


function NeoMetric({
  icon: Icon,
  label,
  value,
  percent = 0,
}) {
  return (
    <div className="neo-metric">

      <div className="neo-metric-head">
        <div>
          <Icon size={14} />
          <span>
            {label}
          </span>
        </div>

        <strong>
          {value}
        </strong>
      </div>

      <div className="neo-meter">
        <div
          style={{
            width:
              `${Math.max(
                0,
                Math.min(
                  percent,
                  100
                )
              )}%`,
          }}
        />
      </div>

    </div>
  )
}
