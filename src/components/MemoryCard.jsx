import {
  MemoryStick,
} from 'lucide-react'

function formatGb(bytes) {
  const value =
    Number(bytes || 0)

  return `${(value / 1_000_000_000).toFixed(1)} GB`
}

export default function MemoryCard({
  percent = 0,
  used = 0,
  available = 0,
  total = 0,
}) {
  const segmentCount = 12

  const activeSegments =
    Math.round(
      (Math.min(
        Math.max(percent, 0),
        100
      ) /
        100) *
        segmentCount
    )

  return (
    <article className="metric-card memory-card-v10">

      <div className="metric-header">
        <div>
          <span className="metric-eyebrow">
            MEMORY BANK
          </span>

          <h2>
            Memory
          </h2>
        </div>

        <MemoryStick size={18} />
      </div>

      <div className="memory-main">

        <div className="memory-stack">
          {Array.from({
            length: segmentCount,
          }).map((_, index) => {
            const active =
              index >=
              segmentCount -
                activeSegments

            return (
              <span
                key={index}
                className={
                  active
                    ? 'active'
                    : ''
                }
              />
            )
          })}
        </div>

        <div className="memory-copy">
          <strong>
            {Number(percent).toFixed(1)}%
          </strong>

          <span className="memory-used-label">
            USED
          </span>

          <p>
            Memory usage
          </p>
        </div>

      </div>

      <div className="memory-stats-v10">

        <div>
          <span>
            USED
          </span>

          <strong>
            {formatGb(used)}
          </strong>
        </div>

        <div>
          <span>
            AVAILABLE
          </span>

          <strong>
            {formatGb(available)}
          </strong>
        </div>

        <div>
          <span>
            TOTAL
          </span>

          <strong>
            {formatGb(total)}
          </strong>
        </div>

      </div>

    </article>
  )
}
