import {
  Activity,
  Clock3,
  Cpu,
  DatabaseBackup,
  Gamepad2,
  Globe2,
  HardDrive,
  MemoryStick,
  Pause,
  Play,
  Power,
  RefreshCw,
  Send,
  Server,
  Shield,
  Terminal,
  Users,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import './MinecraftPage.css'


function formatUptime(seconds) {
  if (seconds == null) return '--'

  const value = Number(seconds)

  const days = Math.floor(value / 86400)
  const hours = Math.floor(
    (value % 86400) / 3600
  )
  const minutes = Math.floor(
    (value % 3600) / 60
  )

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}


function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}) {
  return (
    <article className="mc-stat-card">
      <div className="mc-stat-head">
        <span>{label}</span>
        <Icon size={17} />
      </div>

      <strong>{value}</strong>

      {detail && (
        <small>{detail}</small>
      )}
    </article>
  )
}


function ConsoleLine({ line }) {
  const upper = line.toUpperCase()

  let type = 'normal'

  if (
    upper.includes(' ERROR]') ||
    upper.includes('[ERROR]')
  ) {
    type = 'error'
  } else if (
    upper.includes(' WARN]') ||
    upper.includes('[WARN]')
  ) {
    type = 'warn'
  } else if (
    upper.includes(' INFO]') ||
    upper.includes('[INFO]')
  ) {
    type = 'info'
  }

  return (
    <div
      className={`mc-console-line ${type}`}
    >
      {line}
    </div>
  )
}


export default function MinecraftPage() {
  const [minecraft, setMinecraft] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [busy, setBusy] =
    useState(null)

  const [error, setError] =
    useState(null)

  const [consoleLines, setConsoleLines] =
    useState([])

  const [consoleError, setConsoleError] =
    useState(null)

  const [consolePaused, setConsolePaused] =
    useState(false)

  const [autoScroll, setAutoScroll] =
    useState(true)

  const [command, setCommand] =
    useState('')

  const [sendingCommand, setSendingCommand] =
    useState(false)

  const [consoleUpdated, setConsoleUpdated] =
    useState(null)

  const consoleEndRef = useRef(null)


  async function loadMinecraft() {
    try {
      const response = await fetch(
        '/api/admin/minecraft'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
          'Minecraft API unavailable'
        )
      }

      setMinecraft(data)
      setError(null)

    } catch (err) {
      setError(err.message)

    } finally {
      setLoading(false)
    }
  }


  async function loadConsole() {
    try {
      const response = await fetch(
        '/api/admin/minecraft/logs'
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
          'Console unavailable'
        )
      }

      setConsoleLines(
        Array.isArray(data.lines)
          ? data.lines
          : []
      )

      setConsoleUpdated(new Date())
      setConsoleError(null)

    } catch (err) {
      setConsoleError(err.message)
    }
  }


  useEffect(() => {
    loadMinecraft()

    const interval = setInterval(
      loadMinecraft,
      3000
    )

    return () => clearInterval(interval)
  }, [])


  useEffect(() => {
    if (!consolePaused) {
      loadConsole()
    }

    const interval = setInterval(
      () => {
        if (!consolePaused) {
          loadConsole()
        }
      },
      2500
    )

    return () => clearInterval(interval)
  }, [consolePaused])


  useEffect(() => {
    if (
      autoScroll &&
      !consolePaused
    ) {
      consoleEndRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }, [
    consoleLines,
    autoScroll,
    consolePaused,
  ])


  async function postAction(
    url,
    body = null,
    actionName
  ) {
    try {
      setBusy(actionName)

      const options = {
        method: 'POST',
        headers: {},
      }

      if (body !== null) {
        options.headers['Content-Type'] =
          'application/json'

        options.body =
          JSON.stringify(body)
      }

      const response =
        await fetch(url, options)

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
          'Action failed'
        )
      }

      await loadMinecraft()

    } catch (err) {
      setError(err.message)

    } finally {
      setBusy(null)
    }
  }


  async function sendCommand(event) {
    event?.preventDefault()

    const value = command.trim()

    if (
      !value ||
      sendingCommand ||
      !minecraft?.running
    ) {
      return
    }

    try {
      setSendingCommand(true)

      const response = await fetch(
        '/api/admin/minecraft/command',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            command: value,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.error ||
          'Command failed'
        )
      }

      setCommand('')

      setTimeout(
        loadConsole,
        350
      )

    } catch (err) {
      setConsoleError(err.message)

    } finally {
      setSendingCommand(false)
    }
  }


  const running =
    Boolean(minecraft?.running)

  const publicAccess =
    Boolean(minecraft?.public_access)

  const playersOnline =
    minecraft?.players_online ?? 0

  const playersMax =
    minecraft?.players_max ?? 10

  const cpu =
    minecraft?.cpu != null
      ? `${Number(
          minecraft.cpu
        ).toFixed(1)}%`
      : '--'

  const ram =
    minecraft?.ram_used_mb != null
      ? `${(
          Number(
            minecraft.ram_used_mb
          ) / 1024
        ).toFixed(1)} GB`
      : '--'

  const ramLimit =
    minecraft?.ram_limit_mb != null
      ? `${(
          Number(
            minecraft.ram_limit_mb
          ) / 1024
        ).toFixed(1)} GB`
      : '--'


  return (
    <div className="minecraft-page">

      <section className="mc-hero">
        <div>
          <span className="mc-kicker">
            GAME SERVER / MINECRAFT
          </span>

          <h1>
            {minecraft?.server_name ||
              'AkameVsichkiZaedno'}
          </h1>

          <p>
            Minecraft server control,
            telemetry and public access.
          </p>
        </div>

        <div
          className={`mc-state ${
            running
              ? 'online'
              : 'offline'
          }`}
        >
          <Gamepad2 size={18} />

          <div>
            <span>SERVER STATE</span>

            <strong>
              {running
                ? 'RUNNING'
                : 'STOPPED'}
            </strong>
          </div>
        </div>
      </section>


      {error && (
        <section className="mc-error">
          <Activity size={17} />

          <div>
            <strong>Minecraft API</strong>
            <span>{error}</span>
          </div>
        </section>
      )}


      <section className="mc-status-strip">

        <div>
          <span>MINECRAFT</span>

          <strong
            className={
              running
                ? 'good'
                : 'bad'
            }
          >
            {running
              ? '● RUNNING'
              : '● STOPPED'}
          </strong>
        </div>

        <div>
          <span>PUBLIC ACCESS</span>

          <strong
            className={
              publicAccess
                ? 'good'
                : 'bad'
            }
          >
            {publicAccess
              ? '● OPEN'
              : '● CLOSED'}
          </strong>
        </div>

        <div>
          <span>PLAYERS</span>
          <strong>
            {playersOnline} / {playersMax}
          </strong>
        </div>

        <div>
          <span>LAST BACKUP</span>

          <strong>
            {minecraft?.last_backup || '--'}
          </strong>
        </div>

      </section>


      <section className="mc-stat-grid">

        <StatCard
          icon={Users}
          label="PLAYERS"
          value={
            `${playersOnline} / ${playersMax}`
          }
          detail="Online players"
        />

        <StatCard
          icon={Clock3}
          label="UPTIME"
          value={formatUptime(
            minecraft?.uptime_seconds
          )}
          detail={
            minecraft?.started
              ? `Started ${minecraft.started}`
              : 'Server runtime'
          }
        />

        <StatCard
          icon={MemoryStick}
          label="MEMORY"
          value={ram}
          detail={`${ramLimit} limit`}
        />

        <StatCard
          icon={Cpu}
          label="PROCESSOR"
          value={cpu}
          detail="Minecraft process"
        />

      </section>


      <section className="mc-info-strip">

        <div>
          <Server size={16} />

          <div>
            <span>VERSION</span>
            <strong>
              {minecraft?.version || '--'}
            </strong>
          </div>
        </div>

        <div>
          <HardDrive size={16} />

          <div>
            <span>WORLD</span>
            <strong>
              {minecraft?.world_size || '--'}
            </strong>
          </div>
        </div>

        <div>
          <Globe2 size={16} />

          <div>
            <span>PUBLIC ADDRESS</span>
            <strong>
              {minecraft?.public_address ||
                'sureebi.online'}
            </strong>
          </div>
        </div>

        <div>
          <Server size={16} />

          <div>
            <span>INTERNAL</span>
            <strong>
              {minecraft?.internal_address ||
                '192.168.30.11:25565'}
            </strong>
          </div>
        </div>

      </section>


      <section className="mc-control-panel">

        <div className="mc-control-head">
          <div>
            <span>SERVER CONTROL</span>
            <h2>Operations</h2>
          </div>

          <RefreshCw
            size={18}
            className={
              loading
                ? 'mc-spin'
                : ''
            }
          />
        </div>

        <div className="mc-actions">

          <button
            className={
              publicAccess
                ? 'mc-button danger'
                : 'mc-button success'
            }
            disabled={
              busy !== null ||
              !minecraft
            }
            onClick={() =>
              postAction(
                '/api/admin/minecraft/public-access',
                {
                  enabled:
                    !publicAccess,
                },
                'public'
              )
            }
          >
            <Shield size={17} />

            {busy === 'public'
              ? 'PLEASE WAIT'
              : publicAccess
                ? 'CLOSE PUBLIC ACCESS'
                : 'OPEN PUBLIC ACCESS'}
          </button>


          <button
            className={
              running
                ? 'mc-button danger'
                : 'mc-button success'
            }
            disabled={
              busy !== null ||
              !minecraft
            }
            onClick={() =>
              postAction(
                '/api/admin/minecraft/server-action',
                {
                  action:
                    running
                      ? 'stop'
                      : 'start',
                },
                'server'
              )
            }
          >
            <Power size={17} />

            {busy === 'server'
              ? 'PLEASE WAIT'
              : running
                ? 'STOP SERVER'
                : 'START SERVER'}
          </button>


          <button
            className="mc-button"
            disabled={
              busy !== null ||
              !minecraft
            }
            onClick={() =>
              postAction(
                '/api/admin/minecraft/backup',
                null,
                'backup'
              )
            }
          >
            <DatabaseBackup size={17} />

            {busy === 'backup'
              ? 'BACKING UP'
              : 'BACKUP NOW'}
          </button>

        </div>
      </section>


      <section className="mc-console-panel">

        <div className="mc-console-header">

          <div className="mc-console-title">
            <Terminal size={18} />

            <div>
              <span>CRAFTY TERMINAL</span>
              <h2>Console</h2>
            </div>
          </div>


          <div className="mc-console-meta">

            <span
              className={
                consolePaused
                  ? 'paused'
                  : 'live'
              }
            >
              <i />

              {consolePaused
                ? 'PAUSED'
                : 'LIVE · 2.5 SEC'}
            </span>

            {consoleUpdated && (
              <small>
                {consoleUpdated
                  .toLocaleTimeString()}
              </small>
            )}

          </div>
        </div>


        <div className="mc-console-toolbar">

          <button
            type="button"
            onClick={() =>
              setConsolePaused(
                value => !value
              )
            }
          >
            {consolePaused
              ? <Play size={14} />
              : <Pause size={14} />}

            {consolePaused
              ? 'RESUME'
              : 'PAUSE'}
          </button>


          <label>
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={
                event =>
                  setAutoScroll(
                    event.target.checked
                  )
              }
            />

            AUTO-SCROLL
          </label>


          <button
            type="button"
            onClick={loadConsole}
            disabled={consolePaused}
          >
            <RefreshCw size={14} />
            REFRESH
          </button>

        </div>


        <div className="mc-console-output">

          {consoleError && (
            <div className="mc-console-error">
              {consoleError}
            </div>
          )}

          {consoleLines.length === 0 &&
            !consoleError && (
              <div className="mc-console-empty">
                No console output.
              </div>
            )}

          {consoleLines.map(
            (line, index) => (
              <ConsoleLine
                key={`${index}-${line}`}
                line={line}
              />
            )
          )}

          <div ref={consoleEndRef} />
        </div>


        <form
          className="mc-console-input"
          onSubmit={sendCommand}
        >
          <span>&gt;</span>

          <input
            value={command}
            onChange={
              event =>
                setCommand(
                  event.target.value
                )
            }
            placeholder={
              running
                ? 'Enter server command…'
                : 'Server is stopped'
            }
            disabled={
              !running ||
              sendingCommand
            }
            maxLength={500}
            autoComplete="off"
          />

          <button
            type="submit"
            disabled={
              !running ||
              !command.trim() ||
              sendingCommand
            }
          >
            <Send size={15} />

            {sendingCommand
              ? 'SENDING'
              : 'SEND'}
          </button>
        </form>

      </section>

    </div>
  )
}
