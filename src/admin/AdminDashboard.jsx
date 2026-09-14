import CpuCard from '../components/CpuCard'
import MemoryCard from '../components/MemoryCard'
import TemperatureCard from '../components/TemperatureCard'
import StorageGauge from '../components/StorageGauge'
import StorageActivity from '../components/StorageActivity'
import SystemInfo from '../components/SystemInfo'
import DockerOverview from '../components/DockerOverview'
import StoragePage from '../components/StoragePage'
import SystemPage from '../components/SystemPage'
import ControlPage from '../components/ControlPage'
import DellPage from '../components/DellPage'
import MinecraftPage from '../minecraft/MinecraftPage'


import { useEffect, useState } from 'react'

import {
  Server,
  Activity,
  Database,
  Container,
  Gamepad2,
  Settings,
  Radio,
  Cpu,
  Network,
  Clock3,
  Layers3,
  ChevronLeft,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

import './styles/dashboard.css'
import './styles/storage.css'
import './styles/system.css'
import './styles/storage-overrides.css'
import './styles/control.css'


function AdminDashboard() {
  const [cpuHistory, setCpuHistory] = useState([])
  const [system, setSystem] = useState(null)
  const [storage, setStorage] = useState(null)
  const [docker, setDocker] = useState(null)
  const [online, setOnline] = useState(false)
  const [activePage, setActivePage] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [now, setNow] = useState(new Date())

  async function loadData() {
    try {
      const [systemRes, storageRes] = await Promise.all([
        fetch('/api/system'),
        fetch('/api/storage'),
      ])

      if (!systemRes.ok || !storageRes.ok) {
        throw new Error('System API unavailable')
      }

      const systemData = await systemRes.json()
      const storageData = await storageRes.json()

      setSystem(systemData)
      setStorage(storageData)

      setCpuHistory((prev) => [
        ...prev.slice(-39),
        systemData.cpu ?? 0,
      ])

      setOnline(true)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('System/Storage error:', error)
      setOnline(false)
    }

    try {
      const dockerRes = await fetch('/api/docker')

      if (!dockerRes.ok) {
        throw new Error('Docker API unavailable')
      }

      const dockerData = await dockerRes.json()
      setDocker(dockerData)
    } catch (error) {
      console.error('Docker error:', error)
    }
  }

  useEffect(() => {
    loadData()

    const dataInterval = setInterval(loadData, 3000)
    const clockInterval = setInterval(
      () => setNow(new Date()),
      1000
    )

    return () => {
      clearInterval(dataInterval)
      clearInterval(clockInterval)
    }
  }, [])

  const formatUptime = (seconds) => {
    if (!seconds) return '--'

    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }

    return `${hours}h ${minutes}m`
  }

  const formatClock = (date) =>
    date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

  const containers = docker?.containers || []
  const runningContainers =
    containers.filter(
      (container) =>
        container.status === 'running'
    ).length

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Activity,
    },
    {
      id: 'storage',
      label: 'Storage',
      icon: Database,
    },
    {
      id: 'docker',
      label: 'Docker',
      icon: Container,
    },
    {
      id: 'system',
      label: 'System',
      icon: Settings,
    },
    {
      id: 'dell',
      label: 'Dell',
      icon: Server,
    },
    {
      id: 'minecraft',
      label: 'Minecraft',
      icon: Gamepad2,
    },
    {
      id: 'control',
      label: 'Control',
      icon: SlidersHorizontal,
    },
  ]

  return (
    <div
      className={`app app-v10 ${sidebarCollapsed
        ? 'sidebar-collapsed'
        : ''
        }`}
    >
      <aside
        className={`sidebar sidebar-v10 ${sidebarCollapsed
          ? 'collapsed'
          : ''
          }`}
      >
        <button
          type="button"
          className="sidebar-collapse-button"
          onClick={() =>
            setSidebarCollapsed(
              (value) => !value
            )
          }
          aria-label={
            sidebarCollapsed
              ? 'Expand sidebar'
              : 'Collapse sidebar'
          }
        >
          {sidebarCollapsed
            ? <ChevronRight size={16} />
            : <ChevronLeft size={16} />}
        </button>

        <div className="brand brand-v10">
          <div className="brand-icon">
            <Server size={21} />
          </div>

          <div className="brand-copy">
            <strong>SUREEPI</strong>
            <span>HOME CONTROL NODE</span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon
            const active =
              activePage === item.id

            return (
              <button
                key={item.id}
                className={`nav-item nav-item-v10 ${active
                  ? 'active'
                  : ''
                  }`}
                onClick={() =>
                  setActivePage(item.id)
                }
              >
                <span className="nav-icon-wrap">
                  <Icon size={18} />
                </span>

                <span className="nav-label">
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="sidebar-bottom sidebar-bottom-v10">
          <span
            className={
              online
                ? 'status-dot'
                : 'status-dot offline'
            }
          />

          <div>
            <strong>
              {online
                ? 'System Online'
                : 'System Offline'}
            </strong>

            <span>
              192.168.88.10
            </span>
          </div>
        </div>
      </aside>

      <main className="content content-v10">

        {activePage === 'overview' && (
          <>
            <section className="overview-hero">

              <div>
                <span className="overview-kicker">
                  SUREEPI / NODE CONTROL
                </span>

                <h1>
                  System Command Deck
                </h1>

                <p>
                  Live telemetry, storage,
                  services and hardware state.
                </p>

                <div className="overview-live-meta">
                  <span>
                    <Clock3 size={12} />
                    {formatClock(now)}
                  </span>

                  <span>
                    <RefreshCw size={12} />
                    SYNC{' '}
                    {lastUpdated
                      ? formatClock(lastUpdated)
                      : '--:--:--'}
                  </span>
                </div>
              </div>

              <div
                className="hero-watermark"
                aria-hidden="true"
              >
                SUREEBI
                <span>/</span>
              </div>
              <div className="node-status-card">
                <Radio size={17} />

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

            <section className="telemetry-strip">

              <TelemetryCell
                icon={Cpu}
                label="PLATFORM"
                value="RASPBERRY PI 5"
              />

              <TelemetryCell
                icon={Network}
                label="ADDRESS"
                value="192.168.88.10"
              />

              <TelemetryCell
                icon={Clock3}
                label="UPTIME"
                value={
                  formatUptime(
                    system?.uptime
                  )
                }
              />

              <TelemetryCell
                icon={Layers3}
                label="CONTAINERS"
                value={`${runningContainers}/${containers.length}`}
              />

              <TelemetryCell
                icon={Activity}
                label="REFRESH"
                value="3.0 SEC"
                accent
              />

            </section>

            <section className="metric-grid">

              <CpuCard
                value={system?.cpu || 0}
                history={cpuHistory}
              />

              <MemoryCard
                percent={system?.ram || 0}
                used={system?.ram_used || 0}
                available={system?.ram_available || 0}
                total={system?.ram_total || 0}
              />

              <TemperatureCard
                temperature={
                  system?.temperature || 0
                }
              />

              <StorageGauge
                percent={storage?.percent || 0}
                used={storage?.used || 0}
                free={storage?.free || 0}
                total={storage?.total || 0}
              />

            </section>

            <section className="operations-grid">

              <SystemInfo
                system={system}
                online={online}
                formatUptime={formatUptime}
              />

              <StorageActivity
                storage={storage}
              />

              <DockerOverview
                containers={containers}
              />

            </section>
          </>
        )}

        {activePage === 'storage' && (
          <StoragePage
            storage={storage}
          />
        )}

        {activePage === 'docker' && (
          <div className="standalone-page">
            <span className="overview-kicker">
              CONTAINERS
            </span>

            <h1>Docker</h1>

            <DockerOverview
              containers={containers}
            />
          </div>
        )}

        {activePage === 'system' && (
          <SystemPage
            system={system}
            online={online}
            formatUptime={formatUptime}
          />
        )}

        {activePage === 'dell' && (
          <DellPage />
        )}

        {activePage === 'minecraft' && (
          <MinecraftPage />
        )}

        {activePage === 'control' && (
          <ControlPage
            system={system}
          />
        )}

      </main>
    </div>
  )
}

function TelemetryCell({
  icon: Icon,
  label,
  value,
  accent = false,
}) {
  return (
    <div
      className={`telemetry-cell ${accent ? 'accent' : ''
        }`}
    >
      <div className="telemetry-icon">
        <Icon size={16} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

export default AdminDashboard
