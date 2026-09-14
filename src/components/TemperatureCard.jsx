import {
  ThermometerSun,
} from 'lucide-react'

export default function TemperatureCard({
  temperature = 0,
}) {
  const maxTemp = 85
  const safeMax = 65

  const clamped =
    Math.min(
      Math.max(
        Number(temperature) || 0,
        0
      ),
      maxTemp
    )

  const percent =
    (clamped / maxTemp) * 100

  const safePercent =
    (safeMax / maxTemp) * 100

  const status =
    temperature < 55
      ? 'Optimal'
      : temperature < 65
        ? 'Normal'
        : temperature < 75
          ? 'Warm'
          : 'High'

  return (
    <article className="metric-card temperature-card-v10">

      <div className="metric-header">
        <div>
          <span className="metric-eyebrow">
            THERMAL CORE
          </span>
          <h2>Temperature</h2>
        </div>

        <ThermometerSun size={18} />
      </div>

      <div className="temperature-summary-v10">

        <div>
          <span>CORE</span>

          <strong>
            {Math.round(temperature)}
            <small>°C</small>
          </strong>
        </div>

        <div className="temperature-status-v10">
          <span>STATUS</span>
          <strong>{status}</strong>
        </div>

      </div>

      <div className="temperature-meter-v10">

        <div className="temperature-track-v10">
          <div
            className="temperature-fill-v10"
            style={{
              width: `${percent}%`,
            }}
          />

          <i
            className="temperature-limit-v10"
            style={{
              left: `${safePercent}%`,
            }}
          />

          <i
            className="temperature-marker-v10"
            style={{
              left: `${percent}%`,
            }}
          />
        </div>

        <div className="temperature-scale-v10">
          <span>0°</span>
          <span>25°</span>
          <span>50°</span>
          <span>65°</span>
          <span>85°</span>
        </div>

      </div>

      <div className="temperature-footer-v10">
        <div>
          <span>SAFE RANGE</span>
          <strong>0–65°C</strong>
        </div>

        <div>
          <span>LIMIT</span>
          <strong>85°C</strong>
        </div>
      </div>

    </article>
  )
}
