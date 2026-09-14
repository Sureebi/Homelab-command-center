import {
  HardDrive,
} from 'lucide-react'

function formatGb(bytes) {
  const value =
    Number(bytes || 0)

  return `${(value / 1_000_000_000).toFixed(1)} GB`
}

export default function StorageGauge({
  percent = 0,
  used = 0,
  free = 0,
  total = 0,
}) {
  const clamped =
    Math.min(
      Math.max(
        Number(percent) || 0,
        0
      ),
      100
    )

  const angle =
    180 +
    (clamped / 100) * 180

  const radians =
    (angle * Math.PI) / 180

  const needleLength = 53

  const needleX =
    80 +
    Math.cos(radians) *
      needleLength

  const needleY =
    72 +
    Math.sin(radians) *
      needleLength

  const progressRadius = 58

  const progressX =
    80 +
    Math.cos(radians) *
      progressRadius

  const progressY =
    72 +
    Math.sin(radians) *
      progressRadius

  return (
    <article className="metric-card storage-card-v10">

      <div className="metric-header">
        <div>
          <span className="metric-eyebrow">
            STORAGE ARRAY
          </span>

          <h2>
            Storage
          </h2>
        </div>

        <HardDrive size={18} />
      </div>

      <div className="storage-gauge-v10">

        <svg
          viewBox="0 0 160 100"
          aria-hidden="true"
        >
          <path
            d="M 22 72 A 58 58 0 0 1 138 72"
            className="storage-gauge-track"
          />

          <path
            d="M 22 72 A 58 58 0 0 1 138 72"
            pathLength="100"
            className="storage-gauge-progress"
            style={{
              strokeDasharray:
                `${clamped} ${100 - clamped}`,
            }}
          />

          <line
            x1="28"
            y1="65"
            x2="36"
            y2="62"
            className="storage-gauge-tick"
          />

          <line
            x1="45"
            y1="30"
            x2="51"
            y2="37"
            className="storage-gauge-tick"
          />

          <line
            x1="80"
            y1="17"
            x2="80"
            y2="27"
            className="storage-gauge-tick"
          />

          <line
            x1="115"
            y1="30"
            x2="109"
            y2="37"
            className="storage-gauge-tick"
          />

          <line
            x1="132"
            y1="65"
            x2="124"
            y2="62"
            className="storage-gauge-tick"
          />

          <circle
            cx={progressX}
            cy={progressY}
            r="4"
            className="storage-gauge-accent"
          />

          <line
            x1="80"
            y1="72"
            x2={needleX}
            y2={needleY}
            className="storage-gauge-needle"
          />

          <circle
            cx="80"
            cy="72"
            r="7"
            className="storage-gauge-center"
          />

          <circle
            cx="80"
            cy="72"
            r="2"
            className="storage-gauge-dot"
          />

          <text
            x="80"
            y="14"
            textAnchor="middle"
            className="storage-gauge-label"
          >
            50
          </text>

          <text
            x="21"
            y="87"
            textAnchor="middle"
            className="storage-gauge-label"
          >
            0
          </text>

          <text
            x="139"
            y="87"
            textAnchor="middle"
            className="storage-gauge-label"
          >
            100
          </text>
        </svg>

        <div className="storage-gauge-value-v10">
          <strong>
            {clamped.toFixed(2)}%
          </strong>

          <span>
            USED
          </span>
        </div>

      </div>

      <div className="storage-stats-v10">

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
            FREE
          </span>

          <strong>
            {formatGb(free)}
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
