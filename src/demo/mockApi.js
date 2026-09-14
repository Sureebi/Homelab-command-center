const DEMO_ENABLED = import.meta.env.VITE_DEMO_MODE !== 'false'

const wait = (ms = 160) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    status: init.status || 200,
    headers: { 'Content-Type': 'application/json' },
  })

const ok = (extra = {}) => json({ ok: true, demo: true, ...extra })

const system = {
  hostname: 'SureePi Demo',
  platform: 'Ubuntu Server',
  os: 'Ubuntu Server 24.04 LTS',
  kernel: 'Linux 6.x',
  uptime: '14 days, 6 hours',
  ip: '192.168.30.10',
  cpu: 18,
  cpu_percent: 18,
  memory: 46,
  memory_percent: 46,
  ram: 46,
  disk: 38,
  disk_percent: 38,
  temperature: 51,
  temp: 51,
  load: [0.24, 0.38, 0.41],
}

const storage = {
  used_percent: 38,
  total: '1.8 TB',
  used: '684 GB',
  free: '1.1 TB',
  disks: [
    { name: 'System SSD', mount: '/', used_percent: 42, total: '256 GB', used: '108 GB' },
    { name: 'Media Vault', mount: '/mnt/storage', used_percent: 36, total: '1.6 TB', used: '576 GB' },
  ],
}

const docker = {
  _online: true,
  running: 7,
  stopped: 1,
  total_memory: '3.2 GB',
  containers: [
    { name: 'immich-server', status: 'running', state: 'running', cpu: 4.2, memory: '612 MB' },
    { name: 'actual-budget', status: 'running', state: 'running', cpu: 1.1, memory: '148 MB' },
    { name: 'minecraft', status: 'running', state: 'running', cpu: 8.7, memory: '2.4 GB' },
    { name: 'caddy', status: 'running', state: 'running', cpu: 0.4, memory: '64 MB' },
    { name: 'postgres', status: 'running', state: 'running', cpu: 0.8, memory: '288 MB' },
  ],
}

const dell = {
  hostname: 'Dell Micro Demo',
  ip: '192.168.30.11',
  status: 'online',
  cpu: 12,
  memory: 41,
  temperature: 44,
  containers: {
    immich_server: 'running',
    immich_postgres: 'running',
    immich_redis: 'running',
    immich_machine_learning: 'running',
  },
}

const minecraft = {
  online: true,
  status: 'running',
  started: '2 hours ago',
  players_online: 2,
  max_players: 10,
  version: 'Paper 1.21',
  public_access: false,
  logs: [
    '[12:04:11] Server started',
    '[12:08:45] Player joined: DemoPlayer',
    '[12:22:03] Saved the world',
  ],
}

const control = {
  services: [
    { id: 'dashboard', name: 'SureePi Dashboard', status: 'running' },
    { id: 'minecraft', name: 'Minecraft', status: 'running' },
    { id: 'immich', name: 'Immich', status: 'running' },
    { id: 'actual', name: 'Actual Budget', status: 'running' },
  ],
  power: { restart_available: false, shutdown_available: false },
}

const networkSecurity = {
  lan: { ip: '192.168.30.10' },
  ssh: { status: 'demo', port: 'hidden' },
  ports: [
    { protocol: 'tcp', port: 443, service: 'HTTPS' },
    { protocol: 'tcp', port: 80, service: 'HTTP' },
  ],
  open_ports: [
    { protocol: 'tcp', port: 443, service: 'HTTPS' },
    { protocol: 'tcp', port: 80, service: 'HTTP' },
  ],
}

function route(path) {
  if (path === '/api/system') return json(system)
  if (path === '/api/storage') return json(storage)
  if (path.startsWith('/api/storage/logs')) {
    return json({
      logs: [
        { id: 1, event_type: 'created', type: 'created', path: '/media/photos/demo.jpg', client_ip: '192.168.30.22', created_at: '2026-09-14 12:04' },
        { id: 2, event_type: 'moved', type: 'moved', path: '/media/archive/demo.zip', client_ip: '192.168.30.23', created_at: '2026-09-14 12:22' },
      ],
    })
  }
  if (path === '/api/docker') return json(docker)
  if (path === '/api/dell') return json(dell)
  if (path === '/api/admin/control') return json(control)
  if (path === '/api/admin/control/network-security') return json(networkSecurity)
  if (path.startsWith('/api/admin/control/service/')) return ok({ message: 'Demo mode: service action simulated.' })
  if (path.startsWith('/api/admin/control/diagnostics/')) return ok({ status: 'passed' })
  if (path.startsWith('/api/admin/control/power/')) return ok({ message: 'Demo mode: power action blocked.' })
  if (path === '/api/admin/minecraft') return json(minecraft)
  if (path === '/api/admin/minecraft/logs') return json({ logs: minecraft.logs })
  if (path.startsWith('/api/admin/minecraft/')) return ok({ message: 'Demo mode: Minecraft action simulated.' })
  if (path === '/api/notifications/status') return ok({ enabled: false, subscriptions: 0 })
  if (path === '/api/notifications/public-key') return ok({ public_key: 'demo-public-key' })
  if (path.startsWith('/api/notifications/')) return ok()

  return json({ ok: false, error: `No demo mock for ${path}` }, { status: 404 })
}

export function installDemoMockApi() {
  if (!DEMO_ENABLED || window.__SUREEPI_DEMO_API__) return

  window.__SUREEPI_DEMO_API__ = true
  const realFetch = window.fetch.bind(window)

  window.fetch = async (input, options = {}) => {
    const url = typeof input === 'string' ? input : input.url
    const parsed = new URL(url, window.location.origin)

    if (parsed.pathname.startsWith('/api/')) {
      await wait()
      return route(parsed.pathname, options)
    }

    return realFetch(input, options)
  }
}
