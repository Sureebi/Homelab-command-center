import {
  Cpu,
} from 'lucide-react'

export default function CpuCard({
  value = 0,
  history = [],
}) {
  const points =
    history.length > 1
      ? history
      : [0, 0]

  const width = 360
  const height = 84

  const polyline = points
    .map((point, index) => {
      const x =
        (index /
          Math.max(
            points.length - 1,
            1
          )) *
        width

      const y =
        height -
        (Math.min(
          Math.max(point, 0),
          100
        ) /
          100) *
          height

      return `${x},${y}`
    })
    .join(' ')

  return (
    <article className="metric-card cpu-card-v10">

      <div className="metric-header">
        <div>
          <span className="metric-eyebrow">
            PROCESSOR
          </span>
          <h2>CPU Load</h2>
        </div>

        <Cpu size={18} />
      </div>

      <div className="cpu-summary">
        <div>
          <strong>
            {Number(value).toFixed(1)}%
          </strong>

          <span>
            Current load
          </span>
        </div>

        <span className="live-badge">
          LIVE
        </span>
      </div>

      <div className="cpu-chart">
        <div className="chart-axis">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1={height / 2}
            x2={width}
            y2={height / 2}
            className="chart-grid-line"
          />

          <line
            x1="0"
            y1={height - 1}
            x2={width}
            y2={height - 1}
            className="chart-grid-line"
          />

          <polyline
            points={polyline}
            className="cpu-line"
          />
        </svg>
      </div>

      <div className="chart-footer">
        <span>40 samples</span>
        <span>3 sec interval</span>
      </div>

    </article>
  )
}
