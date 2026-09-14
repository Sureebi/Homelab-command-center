import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  HardDrive,
  Activity,
  FileText,
} from 'lucide-react'

/* =========================================================
   STORAGE PAGE
   ========================================================= */

export default function StoragePage({ storage }) {
  const [activeTab, setActiveTab] = useState('activity')

  if (!storage) {
    return (
      <div className="storage-page">
        Loading storage data...
      </div>
    )
  }

  return (
    <div className="storage-page">

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <div className="storage-page-header">

        <div>
          <span className="eyebrow">
            STORAGE
          </span>

          <h1>
            Main SSD
          </h1>

          <p>
            Storage management, activity and event monitoring
          </p>
        </div>

        <div className="storage-page-status">
          <span />
          ONLINE
        </div>

      </div>


      {/* =====================================================
          STORAGE SUB NAVIGATION
          ===================================================== */}

      <div className="storage-tabs">

        <button
          className={`storage-tab ${activeTab === 'activity'
            ? 'active'
            : ''
            }`}
          onClick={() => setActiveTab('activity')}
        >
          <Activity size={16} />
          <span>Activity</span>
        </button>


        <button
          className={`storage-tab ${activeTab === 'overview'
            ? 'active'
            : ''
            }`}
          onClick={() => setActiveTab('overview')}
        >
          <HardDrive size={16} />
          <span>Overview</span>
        </button>


        <button
          className={`storage-tab ${activeTab === 'logs'
            ? 'active'
            : ''
            }`}
          onClick={() => setActiveTab('logs')}
        >
          <FileText size={16} />
          <span>Logs</span>
        </button>

      </div>


      {/* =====================================================
          OVERVIEW TAB
          ===================================================== */}

      {activeTab === 'overview' && (
        <StorageOverview
          storage={storage}
        />
      )}


      {/* =====================================================
          ACTIVITY TAB
          ===================================================== */}

      {activeTab === 'activity' && (
        <StorageActivityTab
          storage={storage}
        />
      )}


      {/* =====================================================
          LOGS TAB
          ===================================================== */}

      {activeTab === 'logs' && (
        <StorageLogsTab />
      )}

    </div>
  )
}


/* =========================================================
   FORMAT BYTES
   ========================================================= */

function formatBytes(bytes = 0) {
  if (!bytes || bytes <= 0) {
    return '0 B'
  }

  if (bytes < 1024) {
    return `${bytes} B`
  }

  const kb = bytes / 1024

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  const mb = kb / 1024

  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`
  }

  const gb = mb / 1024

  if (gb < 1024) {
    return `${gb.toFixed(1)} GB`
  }

  return `${(
    gb / 1024
  ).toFixed(2)} TB`
}


/* =========================================================
   FORMAT SPEED
   ========================================================= */

function formatSpeed(bytes = 0) {
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

  return `${(
    mb / 1024
  ).toFixed(2)} GB/s`
}


/* =========================================================
   FORMAT STORAGE CAPACITY
   ========================================================= */

function formatGB(bytes = 0) {
  if (!bytes || bytes <= 0) {
    return '0 GB'
  }

  return `${(
    bytes / 1024 ** 3
  ).toFixed(1)} GB`
}


/* =========================================================
   FORMAT LOG TIME
   ========================================================= */

function formatLogTime(timestamp) {
  if (!timestamp) return '--:--:--'

  return new Date(
    timestamp * 1000
  ).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}


/* =========================================================
   FILE NAME FROM PATH
   ========================================================= */

function getFileName(path = '') {
  if (!path) return '--'

  const parts = path.split('/')

  return parts[
    parts.length - 1
  ] || path
}


/* =========================================================
   STORAGE OVERVIEW TAB
   ========================================================= */

function StorageOverview({ storage }) {
  return (
    <div className="storage-tab-content">

      <section className="storage-overview-stats">

        <StorageStat
          label="CAPACITY"
          value={formatGB(storage.total)}
        />

        <StorageStat
          label="USED"
          value={formatGB(storage.used)}
        />

        <StorageStat
          label="FREE"
          value={formatGB(storage.free)}
        />

        <StorageStat
          label="USAGE"
          value={`${storage.percent}%`}
        />

      </section>


      <section className="storage-overview-grid">

        {/* DEVICE INFORMATION */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                DEVICE
              </span>

              <h2>
                Storage Information
              </h2>
            </div>

            <HardDrive />

          </div>


          <div className="storage-info-list">

            <StorageRow
              label="DEVICE"
              value={storage.device}
            />

            <StorageRow
              label="FILESYSTEM"
              value={storage.filesystem}
            />

            <StorageRow
              label="MOUNT"
              value={storage.mount}
            />

            <StorageRow
              label="STATUS"
              value="ONLINE"
            />

          </div>

        </div>


        {/* I/O SUMMARY */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <span className="panel-label">
                I/O SUMMARY
              </span>

              <h2>
                Disk Activity
              </h2>
            </div>

            <Activity />

          </div>


          <div className="storage-info-list">

            <StorageRow
              label="READ TOTAL"
              value={formatBytes(
                storage.read_total
              )}
            />

            <StorageRow
              label="WRITE TOTAL"
              value={formatBytes(
                storage.write_total
              )}
            />

            <StorageRow
              label="READ OPS"
              value={
                storage.read_count?.toLocaleString()
              }
            />

            <StorageRow
              label="WRITE OPS"
              value={
                storage.write_count?.toLocaleString()
              }
            />

          </div>

        </div>

      </section>

    </div>
  )
}


/* =========================================================
   STORAGE ACTIVITY TAB
   ========================================================= */

function StorageActivityTab({ storage }) {
  const [readHistory, setReadHistory] = useState([])
  const [writeHistory, setWriteHistory] = useState([])

  const [peakRead, setPeakRead] = useState(0)
  const [peakWrite, setPeakWrite] = useState(0)

  useEffect(() => {
    if (!storage) return

    const read = storage.read_bytes_sec ?? 0
    const write = storage.write_bytes_sec ?? 0

    setReadHistory((prev) => [
      ...prev.slice(-59),
      read,
    ])

    setWriteHistory((prev) => [
      ...prev.slice(-59),
      write,
    ])

    setPeakRead((prev) =>
      Math.max(prev, read)
    )

    setPeakWrite((prev) =>
      Math.max(prev, write)
    )
  }, [storage])

  if (!storage) return null

  return (
    <div className="storage-tab-content">

      <section className="storage-activity-stats">

        <StorageActivityStat
          label="READ NOW"
          value={formatSpeed(
            storage.read_bytes_sec
          )}
        />

        <StorageActivityStat
          label="WRITE NOW"
          value={formatSpeed(
            storage.write_bytes_sec
          )}
        />

        <StorageActivityStat
          label="PEAK READ"
          value={formatSpeed(
            peakRead
          )}
        />

        <StorageActivityStat
          label="PEAK WRITE"
          value={formatSpeed(
            peakWrite
          )}
        />

      </section>


      {/* READ GRAPH */}

      <section className="panel storage-activity-detail-panel">

        <div className="panel-header">

          <div>
            <span className="panel-label">
              READ ACTIVITY
            </span>

            <h2>
              Live Read Speed
            </h2>
          </div>

          <Activity />

        </div>


        <div className="storage-detail-graph-wrap">

          <StorageLineGraph
            data={readHistory}
            type="read"
          />

        </div>


        <div className="storage-detail-footer">

          <div>
            <span>LIVE</span>

            <strong>
              {formatSpeed(
                storage.read_bytes_sec
              )}
            </strong>
          </div>


          <div>
            <span>PEAK</span>

            <strong>
              {formatSpeed(
                peakRead
              )}
            </strong>
          </div>


          <div>
            <span>TOTAL</span>

            <strong>
              {formatBytes(
                storage.read_total
              )}
            </strong>
          </div>


          <div>
            <span>OPERATIONS</span>

            <strong>
              {storage.read_count?.toLocaleString()}
            </strong>
          </div>

        </div>

      </section>


      {/* WRITE GRAPH */}

      <section className="panel storage-activity-detail-panel">

        <div className="panel-header">

          <div>
            <span className="panel-label">
              WRITE ACTIVITY
            </span>

            <h2>
              Live Write Speed
            </h2>
          </div>

          <Activity />

        </div>


        <div className="storage-detail-graph-wrap">

          <StorageLineGraph
            data={writeHistory}
            type="write"
          />

        </div>


        <div className="storage-detail-footer">

          <div>
            <span>LIVE</span>

            <strong>
              {formatSpeed(
                storage.write_bytes_sec
              )}
            </strong>
          </div>


          <div>
            <span>PEAK</span>

            <strong>
              {formatSpeed(
                peakWrite
              )}
            </strong>
          </div>


          <div>
            <span>TOTAL</span>

            <strong>
              {formatBytes(
                storage.write_total
              )}
            </strong>
          </div>


          <div>
            <span>OPERATIONS</span>

            <strong>
              {storage.write_count?.toLocaleString()}
            </strong>
          </div>

        </div>

      </section>

    </div>
  )
}


/* =========================================================
   STORAGE ACTIVITY STAT
   ========================================================= */

function StorageActivityStat({
  label,
  value,
}) {
  return (
    <div className="storage-activity-stat">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  )
}


/* =========================================================
   STORAGE ACTIVITY GRAPH
   ========================================================= */

function StorageLineGraph({
  data = [],
  type = 'read',
}) {
  const width = 1000
  const height = 170

  if (!data.length) {
    return (
      <div className="storage-graph-empty">
        Waiting for activity...
      </div>
    )
  }

  const max = Math.max(
    ...data,
    1024
  )

  const points = data
    .map((value, index) => {
      const x =
        data.length === 1
          ? 0
          : (
            index /
            (data.length - 1)
          ) * width

      const y =
        height -
        (
          value / max
        ) * (height - 18)

      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      className={`storage-detail-graph ${type}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}


/* =========================================================
   STORAGE LOGS TAB
   ========================================================= */

function StorageLogsTab() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [filter, setFilter] = useState('all')
  const [paused, setPaused] = useState(false)

  const [clearTimestamp, setClearTimestamp] = useState(0)
  const [highlightedIds, setHighlightedIds] = useState([])

  const previousIdsRef = useRef(new Set())
  const initializedRef = useRef(false)

  const terminalBodyRef = useRef(null)
  const shouldStickToBottomRef = useRef(true)
  const initialScrollDoneRef = useRef(false)

  const [hasNewEventsBelow, setHasNewEventsBelow] = useState(false)

  async function loadLogs() {
    try {
      const response = await fetch(
        '/api/storage/logs?limit=100'
      )

      if (!response.ok) {
        throw new Error(
          'Storage logs unavailable'
        )
      }

      const data = await response.json()
      const incomingEvents = data.events || []

      const incomingIds = new Set(
        incomingEvents.map(
          event => event.id
        )
      )

      if (initializedRef.current) {
        const newIds = incomingEvents
          .filter(
            event =>
              !previousIdsRef.current.has(
                event.id
              )
          )
          .map(
            event => event.id
          )

        if (newIds.length > 0) {
          setHighlightedIds(prev => [
            ...new Set([
              ...prev,
              ...newIds,
            ]),
          ])

          setTimeout(() => {
            setHighlightedIds(prev =>
              prev.filter(
                id =>
                  !newIds.includes(id)
              )
            )
          }, 2200)
        }
      }

      previousIdsRef.current = incomingIds
      initializedRef.current = true

      setEvents(incomingEvents)
      setError(false)

    } catch (err) {
      console.error(
        'Storage logs error:',
        err
      )

      setError(true)

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (paused) {
      return
    }

    loadLogs()

    const interval = setInterval(
      loadLogs,
      2000
    )

    return () => {
      clearInterval(interval)
    }
  }, [paused])

  const visibleEvents = useMemo(() => {
    return events.filter(
      event =>
        event.timestamp >
        clearTimestamp
    )
  }, [
    events,
    clearTimestamp,
  ])

  const filteredEvents = useMemo(() => {
    if (filter === 'all') {
      return visibleEvents
    }

    return visibleEvents.filter(
      event =>
        event.event_type === filter
    )
  }, [
    visibleEvents,
    filter,
  ])


  const terminalEvents = useMemo(() => {
    return [...filteredEvents].sort(
      (a, b) =>
        (a.timestamp || 0) -
        (b.timestamp || 0)
    )
  }, [filteredEvents])


  useEffect(() => {
    const terminal = terminalBodyRef.current

    if (!terminal || loading) {
      return
    }

    const frame = requestAnimationFrame(() => {

      if (!initialScrollDoneRef.current) {
        const savedScroll =
          sessionStorage.getItem(
            'sureepi-storage-logs-scroll'
          )

        if (savedScroll !== null) {
          terminal.scrollTop =
            Number(savedScroll)
        } else {
          terminal.scrollTop =
            terminal.scrollHeight
        }

        initialScrollDoneRef.current = true

        const distanceFromBottom =
          terminal.scrollHeight -
          terminal.scrollTop -
          terminal.clientHeight

        shouldStickToBottomRef.current =
          distanceFromBottom < 40

        setHasNewEventsBelow(false)

        return
      }

      if (shouldStickToBottomRef.current) {
        terminal.scrollTop =
          terminal.scrollHeight

        setHasNewEventsBelow(false)
      } else {
        setHasNewEventsBelow(true)
      }
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [terminalEvents, loading])

  const stats = useMemo(() => {
    const result = {
      created: 0,
      moved: 0,
      deleted: 0,
    }

    for (const event of visibleEvents) {
      if (event.event_type === 'created') {
        result.created += 1
      }

      if (event.event_type === 'moved') {
        result.moved += 1
      }

      if (event.event_type === 'deleted') {
        result.deleted += 1
      }
    }

    return result
  }, [visibleEvents])

  function clearView() {
    setClearTimestamp(
      Date.now() / 1000
    )

    setHighlightedIds([])
    setHasNewEventsBelow(false)

    shouldStickToBottomRef.current = true

    sessionStorage.removeItem(
      'sureepi-storage-logs-scroll'
    )
  }

  return (
    <div className="storage-tab-content storage-logs-tab">

      <section className="storage-log-stats">

        <StorageLogStat
          label="EVENTS"
          value={visibleEvents.length}
          description="Visible events"
        />

        <StorageLogStat
          label="CREATED"
          value={stats.created}
          description="Files created"
          type="created"
        />

        <StorageLogStat
          label="MOVED"
          value={stats.moved}
          description="Files moved"
          type="moved"
        />

        <StorageLogStat
          label="DELETED"
          value={stats.deleted}
          description="Files deleted"
          type="deleted"
        />

      </section>

      <section className="storage-terminal">

        <div className="storage-terminal-header">

          <div className="storage-terminal-title">

            <span
              className={`terminal-live-dot ${paused
                ? 'paused'
                : ''
                }`}
            />

            <div>
              <span>
                STORAGE EVENT LOG
              </span>

              <small>
                {paused
                  ? 'Stream paused'
                  : 'Filesystem event stream'}
              </small>
            </div>

          </div>

          <div className="storage-terminal-controls">

            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value
                )
              }
              className="terminal-filter"
            >
              <option value="all">
                ALL EVENTS
              </option>

              <option value="created">
                CREATED
              </option>

              <option value="moved">
                MOVED
              </option>

              <option value="deleted">
                DELETED
              </option>
            </select>

            <button
              type="button"
              className={`terminal-control-button ${paused
                ? 'resume'
                : ''
                }`}
              onClick={() =>
                setPaused(
                  prev => !prev
                )
              }
            >
              <span className="terminal-control-indicator" />

              {paused
                ? 'RESUME'
                : 'PAUSE'}
            </button>

            <button
              type="button"
              className="terminal-control-button clear"
              onClick={clearView}
            >
              CLEAR VIEW
            </button>

          </div>

        </div>

        <div className="storage-terminal-columns">
          <span>#</span>
          <span>TIME</span>
          <span>EVENT</span>
          <span>FILE / PATH</span>
          <span>SOURCE</span>
          <span>SIZE</span>
        </div>

        <div
          className="storage-terminal-body"
          ref={terminalBodyRef}
          onScroll={(event) => {
            const terminal =
              event.currentTarget

            const distanceFromBottom =
              terminal.scrollHeight -
              terminal.scrollTop -
              terminal.clientHeight

            const isAtBottom =
              distanceFromBottom < 40

            shouldStickToBottomRef.current =
              isAtBottom

            sessionStorage.setItem(
              'sureepi-storage-logs-scroll',
              String(terminal.scrollTop)
            )

            if (isAtBottom) {
              setHasNewEventsBelow(false)
            }
          }}
        >

          {loading && (
            <div className="terminal-empty">
              <span>$</span>
              loading storage events...
            </div>
          )}

          {!loading &&
            error && (
              <div className="terminal-empty error">
                <span>!</span>
                unable to read storage event stream
              </div>
            )}

          {!loading &&
            !error &&
            terminalEvents.length === 0 && (
              <div className="terminal-empty">
                <span>$</span>
                waiting for storage events_
              </div>
            )}

          {!loading &&
            !error &&
            terminalEvents.map(
              (event, index) => (

                <StorageTerminalRow
                  key={event.id}
                  event={event}
                  index={index}
                  total={terminalEvents.length}
                  highlighted={
                    highlightedIds.includes(
                      event.id
                    )
                  }
                />

              )
            )}

        </div>

        {hasNewEventsBelow && (
          <button
            type="button"
            className="terminal-new-events-button"
            onClick={() => {
              const terminal =
                terminalBodyRef.current

              if (!terminal) {
                return
              }

              terminal.scrollTo({
                top: terminal.scrollHeight,
                behavior: 'smooth',
              })

              shouldStickToBottomRef.current =
                true

              setHasNewEventsBelow(false)
            }}
          >
            ↓ NEW EVENTS
          </button>
        )}

        <div className="storage-terminal-footer">

          <div>
            Showing{' '}
            <strong>
              {filteredEvents.length}
            </strong>
            {' '}of{' '}
            <strong>
              {visibleEvents.length}
            </strong>
            {' '}events
          </div>

          <div className="terminal-footer-right">

            <span
              className={
                paused
                  ? 'paused'
                  : ''
              }
            >
              {paused
                ? 'PAUSED'
                : 'LIVE'}
            </span>

            <span>
              REFRESH
            </span>

            <strong>
              2s
            </strong>

          </div>

        </div>

      </section>

    </div>
  )
}


/* =========================================================
   STORAGE TERMINAL ROW
   ========================================================= */

function StorageTerminalRow({
  event,
  index,
  total,
  highlighted,
}) {
  const type =
    event.event_type ||
    'unknown'

  const source =
    event.source === 'smb'
      ? 'smb'
      : 'local'

  const fileName =
    getFileName(
      event.destination ||
      event.path
    )

  return (
    <div
      className={`
        storage-terminal-row
        terminal-row-${type}
        ${highlighted
          ? 'new-event'
          : ''
        }
      `}
    >

      <div className="terminal-index">
        {String(
          total - index
        ).padStart(2, '0')}
      </div>

      <div className="terminal-time">

        <span className="mobile-terminal-label">
          TIME
        </span>

        [
        {formatLogTime(
          event.timestamp
        )}
        ]

      </div>

      <div className="terminal-event-cell">

        <span className="mobile-terminal-label">
          EVENT
        </span>

        <span
          className={`terminal-event terminal-event-${type}`}
        >
          {type.toUpperCase()}

          {type === 'moved' && (
            <span>
              →
            </span>
          )}
        </span>

      </div>

      <div className="terminal-file">

        <span className="mobile-terminal-label">
          FILE / PATH
        </span>

        <strong>
          {fileName}
        </strong>

        <span className="terminal-path">
          {event.path}
        </span>

        {event.destination && (
          <span className="terminal-destination">
            → {event.destination}
          </span>
        )}

      </div>

      <div className="terminal-source">

        <span className="mobile-terminal-label">
          SOURCE
        </span>

        <div className="terminal-source-content">

          <span
            className={`source-badge source-${source}`}
          >
            {source === 'smb'
              ? 'SMB'
              : 'LOCAL'}
          </span>

          {source === 'smb' ? (
            <>
              <span className="source-user">
                {event.client_name || event.username || '--'}
              </span>

              <span className="source-ip">
                {event.client_ip || '--'}
              </span>
            </>
          ) : (
            <span className="source-user">
              filesystem
            </span>
          )}

        </div>

      </div>

      <div className="terminal-size">

        <span className="mobile-terminal-label">
          SIZE
        </span>

        {formatBytes(
          event.size
        )}

      </div>

    </div>
  )
}


/* =========================================================
   STORAGE LOG STAT
   ========================================================= */

function StorageLogStat({
  label,
  value,
  description,
  type,
}) {
  return (
    <div className="storage-log-stat">

      <span>
        {label}
      </span>

      <strong
        className={
          type
            ? `log-stat-${type}`
            : ''
        }
      >
        {value}
      </strong>

      <small>
        {description}
      </small>

    </div>
  )
}


/* =========================================================
   STORAGE STAT CARD
   ========================================================= */

function StorageStat({
  label,
  value,
}) {
  return (
    <div className="storage-overview-stat">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>
  )
}


/* =========================================================
   STORAGE INFORMATION ROW
   ========================================================= */

function StorageRow({
  label,
  value,
}) {
  return (
    <div className="storage-info-row">

      <span>
        {label}
      </span>

      <strong>
        {value ?? '--'}
      </strong>

    </div>
  )
}