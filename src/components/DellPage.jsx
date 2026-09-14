import {
  Activity,
  Box,
  CircleCheck,
  CircleX,
  Clock3,
  Cpu,
  Database,
  HardDrive,
  MemoryStick,
  Network,
  RefreshCw,
  Server,
  Thermometer,
} from 'lucide-react'

import { useEffect, useState } from 'react'
import './DellPage.css'

function formatBytes(bytes = 0) {
  const value = Number(bytes || 0)

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} GB`
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} MB`
  }

  return `${value} B`
}

function formatUptime(seconds = 0) {
  const value = Number(seconds || 0)

  const days = Math.floor(value / 86400)
  const hours = Math.floor((value % 86400) / 3600)
  const minutes = Math.floor((value % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }

  return `${hours}h ${minutes}m`
}

function serviceGood(service) {
  if (!service) return false

  return (
    service.status === 'running' &&
    (
      service.health === 'healthy' ||
      service.health === 'none'
    )
  )
}

export default function DellPage() {
  const [dell, setDell] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  async function loadDell() {
    try {
      const response = await fetch('/api/dell')

      if (!response.ok) {
        throw new Error('Dell API unavailable')
      }

      const data = await response.json()

      setDell(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Dell telemetry error:', error)

      setDell({
        online: false,
        error: error.message,
      })
    }
  }

  useEffect(() => {
    loadDell()

    const interval = setInterval(loadDell, 3000)

    return () => clearInterval(interval)
  }, [])

  const online = Boolean(dell?.online)

  const services = [
    {
      key: 'immich_server',
      title: 'Immich Server',
      subtitle: 'Photo server',
      icon: Server,
    },
    {
      key: 'immich_postgres',
      title: 'PostgreSQL',
      subtitle: 'Immich database',
      icon: Database,
    },
    {
      key: 'immich_redis',
      title: 'Valkey',
      subtitle: 'Cache & queue',
      icon: Activity,
    },
    {
      key: 'immich_machine_learning',
      title: 'Machine Learning',
      subtitle: 'Recognition engine',
      icon: Box,
    },
  ]

  return (
    <div className="dell-page">

      <section className="dell-hero">
        <div>
          <span className="dell-kicker">
            REMOTE NODE / COMPUTE
          </span>

          <h1>Dell OptiPlex</h1>

          <p>
            Immich compute node, database host and
            processing engine.
          </p>
        </div>

        <div
          className={`dell-state ${
            online ? 'online' : 'offline'
          }`}
        >
          {online
            ? <CircleCheck size={17} />
            : <CircleX size={17} />}

          <div>
            <span>NODE STATE</span>
            <strong>
              {online ? 'OPERATIONAL' : 'OFFLINE'}
            </strong>
          </div>
        </div>
      </section>

      <section className="dell-telemetry">

        <Telemetry
          icon={Server}
          label="PLATFORM"
          value={dell?.model || 'Dell OptiPlex 7060 Micro'}
        />

        <Telemetry
          icon={Network}
          label="ADDRESS"
          value={dell?.ip || '192.168.30.11'}
        />

        <Telemetry
          icon={Clock3}
          label="UPTIME"
          value={formatUptime(dell?.uptime)}
        />

        <Telemetry
          icon={RefreshCw}
          label="SYNC"
          value={
            lastUpdated
              ? lastUpdated.toLocaleTimeString()
              : '--:--:--'
          }
        />

      </section>

      {!online && (
        <section className="dell-offline-panel">
          <CircleX size={18} />

          <div>
            <strong>Dell node unavailable</strong>
            <span>
              {dell?.error || 'SSH telemetry unavailable'}
            </span>
          </div>
        </section>
      )}

      <section className="dell-resource-grid">

        <ResourceCard
          icon={Cpu}
          label="PROCESSOR"
          title="CPU Load"
          value={`${Number(dell?.cpu || 0).toFixed(1)}%`}
          percent={Number(dell?.cpu || 0)}
          detail={`${dell?.cpu_cores || '--'} cores`}
        />

        <ResourceCard
          icon={MemoryStick}
          label="MEMORY BANK"
          title="Memory"
          value={`${Number(dell?.ram || 0).toFixed(1)}%`}
          percent={Number(dell?.ram || 0)}
          detail={
            `${formatBytes(dell?.ram_used)} / ${formatBytes(dell?.ram_total)}`
          }
        />

        <ResourceCard
          icon={Thermometer}
          label="THERMAL"
          title="Temperature"
          value={`${Number(dell?.temperature || 0).toFixed(0)}°C`}
          percent={
            Math.min(
              (Number(dell?.temperature || 0) / 85) * 100,
              100
            )
          }
          detail="Highest thermal zone"
        />

        <ResourceCard
          icon={HardDrive}
          label="LOCAL NVME"
          title="System Disk"
          value={`${Number(dell?.disk_percent || 0).toFixed(0)}%`}
          percent={Number(dell?.disk_percent || 0)}
          detail={
            `${formatBytes(dell?.disk_used)} / ${formatBytes(dell?.disk_total)}`
          }
        />

      </section>

      <section className="dell-bottom-grid">

        <article className="dell-panel">
          <div className="dell-panel-head">
            <div>
              <span>SERVICES</span>
              <h2>Immich Stack</h2>
            </div>

            <Activity size={18} />
          </div>

          <div className="dell-services">
            {services.map((item) => {
              const service =
                dell?.containers?.[item.key]

              const good = serviceGood(service)

              const Icon = item.icon

              return (
                <div
                  className="dell-service"
                  key={item.key}
                >
                  <div className="dell-service-icon">
                    <Icon size={16} />
                  </div>

                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                  </div>

                  <div
                    className={`dell-service-state ${
                      good ? 'good' : 'bad'
                    }`}
                  >
                    <i />
                    {good
                      ? (
                        service?.health === 'healthy'
                          ? 'HEALTHY'
                          : 'RUNNING'
                      )
                      : (
                        service?.status?.toUpperCase()
                        || 'OFFLINE'
                      )}
                  </div>
                </div>
              )
            })}
          </div>
        </article>

        <article className="dell-panel">
          <div className="dell-panel-head">
            <div>
              <span>STORAGE LINK</span>
              <h2>Pi Storage</h2>
            </div>

            <HardDrive size={18} />
          </div>

          <div className="dell-storage-state">
            <div
              className={`dell-storage-orb ${
                dell?.pi_storage ? 'good' : 'bad'
              }`}
            >
              {dell?.pi_storage
                ? <CircleCheck size={28} />
                : <CircleX size={28} />}
            </div>

            <div>
              <strong>
                {dell?.pi_storage
                  ? 'NFS MOUNTED'
                  : 'NOT MOUNTED'}
              </strong>

              <span>
                192.168.88.10:/mnt/storage/Immich
              </span>

              <small>
                Dell → /mnt/immich-storage → Immich /data
              </small>
            </div>
          </div>

          <div className="dell-system-list">
            <InfoRow label="OS" value={dell?.os} />
            <InfoRow label="Kernel" value={dell?.kernel} />
            <InfoRow
              label="Architecture"
              value={dell?.architecture}
            />
            <InfoRow
              label="Load"
              value={
                `${dell?.load_1 ?? '--'} / ${dell?.load_5 ?? '--'} / ${dell?.load_15 ?? '--'}`
              }
            />
          </div>
        </article>

      </section>
    </div>
  )
}

function Telemetry({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="dell-telemetry-cell">
      <Icon size={16} />

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function ResourceCard({
  icon: Icon,
  label,
  title,
  value,
  percent,
  detail,
}) {
  const width = Math.max(
    0,
    Math.min(Number(percent || 0), 100)
  )

  return (
    <article className="dell-resource-card">
      <div className="dell-resource-head">
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>

        <Icon size={18} />
      </div>

      <strong className="dell-resource-value">
        {value}
      </strong>

      <div className="dell-meter">
        <div style={{ width: `${width}%` }} />
      </div>

      <small>{detail}</small>
    </article>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="dell-info-row">
      <span>{label}</span>
      <strong>{value || '--'}</strong>
    </div>
  )
}
