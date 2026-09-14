import { useEffect, useState } from 'react'
import { HardDrive, Activity } from 'lucide-react'

function formatSpeed(bytes) {
  if (!bytes || bytes <= 0) return '0 KB/s'

  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB/s`

  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB/s`

  return `${(mb / 1024).toFixed(2)} GB/s`
}

function formatData(bytes) {
  if (!bytes || bytes <= 0) return '0 MB'

  const mb = bytes / 1024 ** 2
  if (mb < 1024) return `${mb.toFixed(1)} MB`

  const gb = mb / 1024
  if (gb < 1024) return `${gb.toFixed(1)} GB`

  return `${(gb / 1024).toFixed(2)} TB`
}

function formatGB(bytes) {
  return (bytes / 1024 ** 3).toFixed(1)
}

function formatCount(value) {
  return new Intl.NumberFormat('en-US').format(value || 0)
}

function LineGraph({ data }) {
  const width = 600
  const height = 85

  if (!data.length) return null

  const max = Math.max(...data, 1024)

  const points = data
    .map((value, index) => {
      const x =
        data.length === 1
          ? 0
          : (index / (data.length - 1)) * width

      const y = height - (value / max) * (height - 10)

      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      className="storage-activity-graph"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function StorageActivity({ storage }) {
  const [readHistory, setReadHistory] = useState([])
  const [writeHistory, setWriteHistory] = useState([])

  useEffect(() => {
    if (!storage) return

    setReadHistory((prev) => [
      ...prev.slice(-29),
      storage.read_bytes_sec ?? 0,
    ])

    setWriteHistory((prev) => [
      ...prev.slice(-29),
      storage.write_bytes_sec ?? 0,
    ])
  }, [storage])

  if (!storage) return null

  return (
    <section className="panel storage-activity-panel">

      <div className="panel-header">
        <div>
          <span className="eyebrow">STORAGE ACTIVITY</span>
          <h3>Main SSD</h3>
        </div>

        <HardDrive size={20} />
      </div>

      <div className="storage-activity-summary">

        <div className="storage-free">
          <strong>{formatGB(storage.free)} GB</strong>
          <span>FREE</span>
        </div>

        <div className="storage-device">
          <span>{storage.device}</span>
          <strong>{storage.filesystem}</strong>
        </div>

      </div>

      <div className="io-values">

        <div>
          <span className="io-label">
            <Activity size={13} />
            READ
          </span>

          <strong>{formatSpeed(storage.read_bytes_sec)}</strong>
        </div>

        <div>
          <span className="io-label">
            <Activity size={13} />
            WRITE
          </span>

          <strong>{formatSpeed(storage.write_bytes_sec)}</strong>
        </div>

      </div>

      <div className="io-graphs">

        <div className="io-graph-row">
          <span>R</span>
          <LineGraph data={readHistory} />
        </div>

        <div className="io-graph-row write">
          <span>W</span>
          <LineGraph data={writeHistory} />
        </div>

      </div>

      <div className="storage-meta">

        <div>
          <span>MOUNT</span>
          <strong>{storage.mount}</strong>
        </div>

        <div>
          <span>USED</span>
          <strong>{formatGB(storage.used)} GB</strong>
        </div>

        <div>
          <span>STATUS</span>
          <strong className="storage-online">
            <i />
            ONLINE
          </strong>
        </div>

      </div>

      <div className="storage-io-stats">

        <div>
          <span>READ TOTAL</span>
          <strong>{formatData(storage.read_total)}</strong>
        </div>

        <div>
          <span>WRITE TOTAL</span>
          <strong>{formatData(storage.write_total)}</strong>
        </div>

        <div>
          <span>READ OPS</span>
          <strong>{formatCount(storage.read_count)}</strong>
        </div>

        <div>
          <span>WRITE OPS</span>
          <strong>{formatCount(storage.write_count)}</strong>
        </div>

      </div>

    </section>
  )
}