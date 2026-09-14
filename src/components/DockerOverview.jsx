import { useMemo, useState } from 'react'
import { Box } from 'lucide-react'

function formatMemory(bytes = 0) {
  if (!bytes || bytes <= 0) return '0 MB'

  const mb = bytes / 1024 ** 2

  if (mb < 1024) {
    return `${mb.toFixed(0)} MB`
  }

  return `${(mb / 1024).toFixed(1)} GB`
}

function formatUptime(seconds = 0) {
  if (!seconds) return '--'

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h`
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }

  return `${minutes}m`
}

export default function DockerOverview({ containers = [] }) {
  const [expanded, setExpanded] = useState(false)

  const sortedContainers = useMemo(() => {
    return [...containers].sort((a, b) => {
      const aRunning = a.status === 'running'
      const bRunning = b.status === 'running'

      if (aRunning === bRunning) return 0

      return aRunning ? 1 : -1
    })
  }, [containers])

  const runningContainers = containers.filter(
    (container) => container.status === 'running'
  ).length

  const totalMemoryUsage = containers.reduce(
    (total, container) => total + (container.memory_usage || 0),
    0
  )

  const visibleContainers = expanded
    ? sortedContainers
    : sortedContainers.slice(0, 4)

  const hasMore = containers.length > 4

  return (
    <section className="panel docker-panel">

      {/* HEADER */}

      <div className="panel-header">

        <div>
          <span className="panel-label">DOCKER</span>
          <h2>Containers</h2>
        </div>

        <Box />

      </div>


      {/* SUMMARY */}

      <div className="docker-overview-head">

        <div className="docker-summary">
          <strong>{runningContainers}</strong>

          <span>
            running / {containers.length} total
          </span>
        </div>


        {/* TOTAL RAM + VIEW ALL */}

        <div className="docker-summary-actions">

          <div className="docker-total-memory">
            <span>TOTAL RAM</span>
            <strong>
              {formatMemory(totalMemoryUsage)}
            </strong>
          </div>

          {hasMore && (
            <button
              className="docker-view-button"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded
                ? 'SHOW LESS'
                : `VIEW ALL (${containers.length})`}
            </button>
          )}

        </div>

      </div>


      {/* CONTAINERS */}

      <div
        className={`docker-container-grid ${
          expanded ? 'expanded' : ''
        }`}
      >

        {visibleContainers.map((container) => (

          <div
            className={`docker-container-card ${
              container.status !== 'running'
                ? 'stopped'
                : ''
            }`}
            key={container.name}
          >

            {/* CONTAINER HEADER */}

            <div className="docker-container-top">

              <div className="docker-container-title">

                <span
                  className={`container-dot ${
                    container.status !== 'running'
                      ? 'stopped'
                      : ''
                  }`}
                />

                <div>
                  <strong>
                    {container.name}
                  </strong>

                  <span>
                    {container.image}
                  </span>
                </div>

              </div>


              {/* STATUS */}

              <span
                className={`container-status ${
                  container.status !== 'running'
                    ? 'stopped'
                    : ''
                }`}
              >
                {container.status}
              </span>

            </div>


            {/* LIVE STATS */}

            <div className="docker-container-stats">

              <div>
                <span>CPU</span>

                <strong>
                  {Number(
                    container.cpu_percent || 0
                  ).toFixed(1)}%
                </strong>
              </div>

              <div>
                <span>MEMORY</span>

                <strong>
                  {formatMemory(
                    container.memory_usage
                  )}
                </strong>
              </div>

              <div>
                <span>UPTIME</span>

                <strong>
                  {container.status === 'running'
                    ? formatUptime(container.uptime)
                    : '--'}
                </strong>
              </div>

            </div>

          </div>

        ))}

      </div>


      {/* EMPTY STATE */}

      {containers.length === 0 && (
        <div className="docker-empty">
          No containers found
        </div>
      )}

    </section>
  )
}