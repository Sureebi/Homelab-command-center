import {
  Activity,
  Bell,
  Box,
  CheckCircle2,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
  Square,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'


export default function ControlPage({
  system,
}) {
  const [control, setControl] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [serviceAction, setServiceAction] =
    useState(null)

  const [controlError, setControlError] =
    useState('')

  const [diagnostic, setDiagnostic] =
    useState(null)

  const [activeDiagnostic, setActiveDiagnostic] =
    useState(null)

  const [powerConfirm, setPowerConfirm] =
    useState(null)

  const [powerLoading, setPowerLoading] =
    useState(false)

  const [powerError, setPowerError] =
    useState(null)

  const [networkSecurity, setNetworkSecurity] =
  useState(null)

  const [diagnosticLoading, setDiagnosticLoading] =
    useState(null)

  const [pushSupported, setPushSupported] =
    useState(false)

  const [pushPermission, setPushPermission] =
    useState('default')

  const [pushSubscribed, setPushSubscribed] =
    useState(false)

  const [pushServerCount, setPushServerCount] =
    useState(0)

  const [pushLoading, setPushLoading] =
    useState(false)

  const [pushMessage, setPushMessage] =
    useState('')

  const [pushError, setPushError] =
    useState('')


  function urlBase64ToUint8Array(
    base64String
  ) {
    const padding =
      '='.repeat(
        (4 - base64String.length % 4)
        % 4
      )

    const base64 = (
      base64String
        .replace(/-/g, '+')
        .replace(/_/g, '/')
      + padding
    )

    const rawData =
      window.atob(base64)

    return Uint8Array.from(
      [...rawData].map(
        character =>
          character.charCodeAt(0)
      )
    )
  }


  function getPushDeviceName() {
    const userAgent =
      navigator.userAgent || ''

    if (
      /iPhone|iPad|iPod/i.test(
        userAgent
      )
    ) {
      return 'Apple PWA'
    }

    if (
      /Android/i.test(
        userAgent
      )
    ) {
      return 'Android PWA'
    }

    return (
      navigator.platform
      || 'Web Browser'
    )
  }


  async function refreshPushStatus() {
    const supported = (
      'serviceWorker' in navigator
      && 'PushManager' in window
      && 'Notification' in window
    )

    setPushSupported(
      supported
    )

    if (!supported) {
      setPushPermission(
        'unsupported'
      )

      setPushSubscribed(
        false
      )

      return
    }

    setPushPermission(
      Notification.permission
    )

    try {
      const registration =
        await navigator
          .serviceWorker
          .ready

      const subscription =
        await registration
          .pushManager
          .getSubscription()

      setPushSubscribed(
        Boolean(subscription)
      )

    } catch (error) {
      console.error(
        'Push status failed:',
        error
      )
    }

    try {
      const response =
        await fetch(
          '/api/notifications/status'
        )

      const data =
        await response.json()

      if (
        response.ok
        && data.ok
      ) {
        setPushServerCount(
          data.subscriptions || 0
        )
      }

    } catch (error) {
      console.error(
        'Push server status failed:',
        error
      )
    }
  }


  async function enablePushNotifications() {
    setPushLoading(true)
    setPushMessage('')
    setPushError('')

    try {
      const supported = (
        'serviceWorker' in navigator
        && 'PushManager' in window
        && 'Notification' in window
      )

      if (!supported) {
        throw new Error(
          'Push notifications are not supported on this device.'
        )
      }

      let permission =
        Notification.permission

      if (
        permission === 'default'
      ) {
        permission =
          await Notification
            .requestPermission()
      }

      setPushPermission(
        permission
      )

      if (
        permission !== 'granted'
      ) {
        throw new Error(
          'Notification permission was not granted.'
        )
      }

      const keyResponse =
        await fetch(
          '/api/notifications/public-key'
        )

      const keyData =
        await keyResponse.json()

      if (
        !keyResponse.ok
        || !keyData.ok
        || !keyData.public_key
      ) {
        throw new Error(
          keyData.error
          || 'Unable to load VAPID public key.'
        )
      }

      const registration =
        await navigator
          .serviceWorker
          .ready

      let subscription =
        await registration
          .pushManager
          .getSubscription()

      if (!subscription) {
        subscription =
          await registration
            .pushManager
            .subscribe({
              userVisibleOnly: true,

              applicationServerKey:
                urlBase64ToUint8Array(
                  keyData.public_key
                ),
            })
      }

      const json =
        subscription.toJSON()

      if (
        !json.keys
        || !json.keys.p256dh
        || !json.keys.auth
      ) {
        throw new Error(
          'Browser returned an incomplete push subscription.'
        )
      }

      const saveResponse =
        await fetch(
          '/api/notifications/subscribe',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              endpoint:
                subscription.endpoint,

              p256dh:
                json.keys.p256dh,

              auth:
                json.keys.auth,

              device_name:
                getPushDeviceName(),
            }),
          }
        )

      const saveData =
        await saveResponse.json()

      if (
        !saveResponse.ok
        || !saveData.ok
      ) {
        throw new Error(
          saveData.error
          || 'Unable to save push subscription.'
        )
      }

      setPushSubscribed(true)

      setPushMessage(
        'This device is now registered for SUREEPI notifications.'
      )

      await refreshPushStatus()

    } catch (error) {
      console.error(
        'Enable push failed:',
        error
      )

      setPushError(
        error.message
        || 'Unable to enable notifications.'
      )

    } finally {
      setPushLoading(false)
    }
  }


  async function disablePushNotifications() {
    setPushLoading(true)
    setPushMessage('')
    setPushError('')

    try {
      const registration =
        await navigator
          .serviceWorker
          .ready

      const subscription =
        await registration
          .pushManager
          .getSubscription()

      if (subscription) {
        const response =
          await fetch(
            '/api/notifications/unsubscribe',
            {
              method: 'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body: JSON.stringify({
                endpoint:
                  subscription.endpoint,
              }),
            }
          )

        const data =
          await response.json()

        if (
          !response.ok
          || !data.ok
        ) {
          throw new Error(
            data.error
            || 'Unable to remove subscription.'
          )
        }

        await subscription.unsubscribe()
      }

      setPushSubscribed(false)

      setPushMessage(
        'Notifications disabled on this device.'
      )

      await refreshPushStatus()

    } catch (error) {
      console.error(
        'Disable push failed:',
        error
      )

      setPushError(
        error.message
        || 'Unable to disable notifications.'
      )

    } finally {
      setPushLoading(false)
    }
  }


  async function sendPushTest() {
    setPushLoading(true)
    setPushMessage('')
    setPushError('')

    try {
      const response =
        await fetch(
          '/api/notifications/test',
          {
            method: 'POST',
          }
        )

      const data =
        await response.json()

      if (
        !response.ok
        || !data.ok
      ) {
        throw new Error(
          data.error
          || 'Push test failed.'
        )
      }

      setPushMessage(
        `Test sent to ${data.sent} device${
          data.sent === 1
            ? ''
            : 's'
        }.`
      )

      await refreshPushStatus()

    } catch (error) {
      console.error(
        'Push test failed:',
        error
      )

      setPushError(
        error.message
        || 'Unable to send test notification.'
      )

    } finally {
      setPushLoading(false)
    }
  }


  useEffect(() => {
    refreshPushStatus()
  }, [])


  async function loadControl() {
    try {
      const response =
        await fetch(
          '/api/admin/control'
        )

      if (!response.ok) {
        throw new Error(
          'Control API unavailable'
        )
      }

      const data =
        await response.json()

      setControl(data)
      setControlError('')

    } catch (error) {
      console.error(
        'Control load failed:',
        error
      )

      setControlError(
        'Unable to load service status.'
      )

    } finally {
      setLoading(false)
    }
  }

async function loadNetworkSecurity() {
  try {
    const response = await fetch(
      '/api/admin/control/network-security'
    )

    const data = await response.json()

    if (!response.ok || !data.ok) {
      throw new Error(
        'Network security API unavailable'
      )
    }

    setNetworkSecurity(data)

  } catch (error) {
    console.error(
      'Network security load failed:',
      error
    )
  }
}

  async function runServiceAction(
    service,
    action
  ) {
    const actionKey =
      `${service.id}:${action}`

    setServiceAction(
      actionKey
    )

    setControlError('')

    try {
      const response =
        await fetch(
          `/api/admin/control/service/${service.id}/${action}`,
          {
            method: 'POST',
          }
        )

      const data =
        await response.json()

      if (
        !response.ok
        || !data.ok
      ) {
        throw new Error(
          data.error
          || `Unable to ${action} service`
        )
      }

      await new Promise(
        resolve =>
          setTimeout(
            resolve,
            800
          )
      )

      await loadControl()

    } catch (error) {
      console.error(
        'Service action failed:',
        error
      )

      /*
       * Restarting the dashboard can
       * temporarily kill the API request
       * that initiated the restart.
       */
      if (
        service.id ===
        'sureepi-dashboard'
        && action === 'restart'
      ) {
        setTimeout(
          loadControl,
          2500
        )
      } else {
        setControlError(
          error.message
          || 'Service action failed.'
        )
      }

    } finally {
      setServiceAction(
        null
      )
    }
  }


  useEffect(() => {
    loadControl()
    loadNetworkSecurity()

    const interval =
      setInterval(
        loadControl,
        5000
      )

    const networkInterval =
  setInterval(
    loadNetworkSecurity,
    10000
  )

    return () =>
      clearInterval(interval)
      clearInterval(networkInterval)
  }, [])

  async function runDiagnostic(checkId) {
    setActiveDiagnostic(checkId)
    setDiagnosticLoading(checkId)

    try {
      const response = await fetch(
        `/api/admin/control/diagnostics/${checkId}`
      )

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(
          data.error || 'Diagnostic failed'
        )
      }

      setDiagnostic(data)

    } catch (error) {
      console.error(
        'Diagnostic failed:',
        error
      )

      setDiagnostic({
        ok: false,
        title: 'Diagnostic Error',
        status: 'error',
        items: [
          {
            label: 'Diagnostic',
            value: 'Failed',
            status: 'error',
            detail: error.message,
          },
        ],
      })

    } finally {
      setDiagnosticLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="control-loading">
        Loading control services...
      </div>
    )
  }


  const services =
    control?.services || []

  const ramPercent =
    Number(
      system?.ram || 0
    )

  const temperature =
    Number(
      system?.temperature || 0
    )

  const cpu =
    Number(
      system?.cpu || 0
    )

  async function runPowerAction() {
  if (!powerConfirm) return

  setPowerLoading(true)
  setPowerError(null)

  try {
    const response = await fetch(
      `/api/admin/control/power/${powerConfirm}`,
      {
        method: 'POST',
      }
    )

    const data = await response.json()

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error || 'Power command failed'
      )
    }

    if (powerConfirm === 'reboot') {
      setPowerConfirm('rebooting')
    } else {
      setPowerConfirm('shutting-down')
    }

  } catch (error) {
    console.error(
      'Power action failed:',
      error
    )

    setPowerError(error.message)
    setPowerLoading(false)
  }
}

  return (
    <div className="control-page">

      <section className="control-header">

        <div>

          <span className="control-kicker">
            SUREEPI / ADMINISTRATION
          </span>

          <h1>
            Control Center
          </h1>

          <p>
            Manage services, system
            operations and diagnostics.
          </p>

        </div>


        <div className="control-status">

          <CheckCircle2 size={17} />

          NODE OPERATIONAL

        </div>

      </section>


      <section className="control-system-card">

        <div className="control-system-icon">

          <Server size={24} />

        </div>


        <div>

          <span>
            SYSTEM
          </span>

          <h2>
            Raspberry Pi 5
          </h2>

          <p>
            Main SUREEPI control node
          </p>

        </div>


        <div className="control-system-meta">

          <div>

            <span>
              CPU
            </span>

            <strong>
              {cpu.toFixed(1)}
              %
            </strong>

          </div>


          <div>

            <span>
              MEMORY
            </span>

            <strong>
              {ramPercent.toFixed(1)}
              %
            </strong>

          </div>


          <div>

            <span>
              TEMP
            </span>

            <strong>
              {temperature.toFixed(0)}
              °C
            </strong>

          </div>

        </div>

      </section>


      {controlError && (
        <div className="control-error">
          {controlError}
        </div>
      )}


      <section className="control-section">

        <div className="control-section-title">

          <div>

            <Activity size={18} />

            <div>

              <span>
                SERVICES
              </span>

              <h2>
                Core services
              </h2>

            </div>

          </div>


          <button
            type="button"
            className="control-refresh"
            onClick={
              loadControl
            }
          >

            <RefreshCw
              size={15}
            />

            Refresh

          </button>

        </div>


        <div className="control-service-grid">

          {services.map(
            service => {

              const running =
                service.status
                === 'active'

              const protectedService =
                service.id ===
                'sureepi-dashboard'

              const serviceBusy =
                serviceAction
                  ?.startsWith(
                    `${service.id}:`
                  )

              const starting =
                serviceAction ===
                `${service.id}:start`

              const stopping =
                serviceAction ===
                `${service.id}:stop`

              const restarting =
                serviceAction ===
                `${service.id}:restart`


              return (
                <article
                  className="control-service-card"
                  key={service.id}
                >

                  <div className="control-service-top">

                    <div className="control-service-icon">

                      <Box size={19} />

                    </div>


                    <span
                      className={
                        `control-service-state ${running
                          ? 'running'
                          : 'stopped'
                        }`
                      }
                    >

                      <i />

                      {running
                        ? 'RUNNING'
                        : service.status
                          ?.toUpperCase()
                        || 'UNKNOWN'
                      }

                    </span>

                  </div>


                  <h3>
                    {service.label}
                  </h3>

                  <p>
                    {service.service}
                  </p>


                  <div className="control-service-meta">

                    <span>
                      STARTUP
                    </span>

                    <strong>
                      {service.enabled
                        ?.toUpperCase()
                        || 'UNKNOWN'}
                    </strong>

                  </div>


                  <div className="control-service-actions">

                    {!running && (
                      <button
                        type="button"
                        className="control-service-start"
                        disabled={
                          serviceBusy
                        }
                        onClick={() =>
                          runServiceAction(
                            service,
                            'start'
                          )
                        }
                      >

                        {starting ? (
                          <RefreshCw
                            size={14}
                            className="control-spin"
                          />
                        ) : (
                          <Play
                            size={14}
                          />
                        )}

                        {starting
                          ? 'Starting...'
                          : 'Start'
                        }

                      </button>
                    )}


                    {running && (
                      <>

                        {!protectedService && (
                          <button
                            type="button"
                            className="control-service-stop"
                            disabled={
                              serviceBusy
                            }
                            onClick={() =>
                              runServiceAction(
                                service,
                                'stop'
                              )
                            }
                          >

                            {stopping ? (
                              <RefreshCw
                                size={14}
                                className="control-spin"
                              />
                            ) : (
                              <Square
                                size={13}
                              />
                            )}

                            {stopping
                              ? 'Stopping...'
                              : 'Stop'
                            }

                          </button>
                        )}


                        <button
                          type="button"
                          className="control-service-restart"
                          disabled={
                            serviceBusy
                          }
                          onClick={() =>
                            runServiceAction(
                              service,
                              'restart'
                            )
                          }
                        >

                          <RefreshCw
                            size={14}
                            className={
                              restarting
                                ? 'control-spin'
                                : ''
                            }
                          />

                          {restarting
                            ? 'Restarting...'
                            : 'Restart'
                          }

                        </button>

                      </>
                    )}

                  </div>

                </article>
              )
            }
          )}

        </div>

      </section>

<section className="control-section control-network-section">

  <div className="control-section-title">

    <div>

      <ShieldCheck size={18} />

      <div>
        <span>
          NETWORK & SECURITY
        </span>

        <h2>
          Connectivity and exposure
        </h2>
      </div>

    </div>

    <button
      type="button"
      className="control-refresh"
      onClick={loadNetworkSecurity}
    >
      <RefreshCw size={15} />
      Refresh
    </button>

  </div>


  <div className="control-network-grid">

    <article className="control-network-card">

      <div className="control-network-card-top">

        <span>
          LAN
        </span>

        <strong
          className={
            networkSecurity?.lan?.status === 'online'
              ? 'network-good'
              : 'network-bad'
          }
        >
          ●{' '}
          {networkSecurity?.lan?.status
            ?.toUpperCase()
            || 'UNKNOWN'
          }
        </strong>

      </div>

      <h3>
        {networkSecurity?.lan?.interface
          || '--'
        }
      </h3>

      <p>
        {networkSecurity?.lan?.ip
          || '--'
        }
      </p>

      <div className="control-network-meta">

        <span>
          GATEWAY
        </span>

        <strong>
          {networkSecurity?.lan?.gateway
            || '--'
          }
        </strong>

      </div>

    </article>


    <article className="control-network-card">

      <div className="control-network-card-top">

        <span>
          INTERNET
        </span>

        <strong
          className={
            networkSecurity?.internet?.status ===
              'reachable'
              ? 'network-good'
              : 'network-bad'
          }
        >
          ●{' '}
          {networkSecurity?.internet?.status
            ?.toUpperCase()
            || 'UNKNOWN'
          }
        </strong>

      </div>

      <h3>
        External connectivity
      </h3>

      <p>
        Cloud and external services
      </p>

    </article>


    <article className="control-network-card">

      <div className="control-network-card-top">

        <span>
          SSH
        </span>

        <strong
          className={
            networkSecurity?.ssh?.status === 'active'
              ? 'network-good'
              : 'network-bad'
          }
        >
          ●{' '}
          {networkSecurity?.ssh?.status
            ?.toUpperCase()
            || 'UNKNOWN'
          }
        </strong>

      </div>

      <h3>
        Secure Shell
      </h3>

      <p>
        Remote administration
      </p>

      <div className="control-network-meta">

        <span>
          PORT
        </span>

        <strong>
          {networkSecurity?.ssh?.port
            || '--'
          }
        </strong>

      </div>

    </article>


    <article className="control-network-card">

      <div className="control-network-card-top">

        <span>
          FIREWALL
        </span>

        <strong
          className={
            networkSecurity?.firewall?.status ===
              'not_configured'
              ? 'network-warning'
              : 'network-good'
          }
        >
          ●{' '}
          {networkSecurity?.firewall?.status
            ?.replaceAll('_', ' ')
            ?.toUpperCase()
            || 'UNKNOWN'
          }
        </strong>

      </div>

      <h3>
        Packet filtering
      </h3>

      <p>
        {networkSecurity?.firewall?.backend
          || '--'
        }
      </p>

    </article>

  </div>


  <div className="control-ports-panel">

    <div className="control-ports-header">

      <div>
        <span>
          LISTENING SERVICES
        </span>

        <h3>
          Exposed TCP ports
        </h3>
      </div>

      <strong>
        {
          networkSecurity?.ports
            ?.length || 0
        } LISTENING
      </strong>

    </div>


    <div className="control-port-list">

      {networkSecurity?.ports
        ?.map(
          port => (

            <div
              className="control-port-row"
              key={`${port.protocol}-${port.port}`}
            >

              <div>
                <strong>
                  {port.service}
                </strong>

                <span>
                  {port.protocol}
                </span>
              </div>

              <code>
                {port.port}
              </code>

              <span className="control-port-status">
                ● LISTENING
              </span>

            </div>

          )
        )}

    </div>

  </div>

</section>

      <section className="control-section">

        <div className="control-section-title">

          <div>

            <ShieldCheck
              size={18}
            />

            <div>

              <span>
                QUICK DIAGNOSTICS
              </span>

              <h2>
                System checks
              </h2>

            </div>

          </div>

        </div>


        <div className="control-diagnostics-grid">

          <button
            type="button"
            className={
              activeDiagnostic === 'system'
                ? 'active'
                : ''
            }
            onClick={() =>
              runDiagnostic('system')
            }
            disabled={
              diagnosticLoading !== null
            }
          >
            {diagnosticLoading === 'system'
              ? 'Checking...'
              : 'System Check'
            }
          </button>


          <button
            type="button"
            className={
              activeDiagnostic === 'network'
                ? 'active'
                : ''
            }
            onClick={() =>
              runDiagnostic('network')
            }
            disabled={
              diagnosticLoading !== null
            }
          >
            {diagnosticLoading === 'network'
              ? 'Checking...'
              : 'Network Check'
            }
          </button>


          <button
            type="button"
            className={
              activeDiagnostic === 'storage'
                ? 'active'
                : ''
            }
            onClick={() =>
              runDiagnostic('storage')
            }
            disabled={
              diagnosticLoading !== null
            }
          >
            {diagnosticLoading === 'storage'
              ? 'Checking...'
              : 'Storage Check'
            }
          </button>


          <button
            type="button"
            className={
              activeDiagnostic === 'failed-services'
                ? 'active'
                : ''
            }
            onClick={() =>
              runDiagnostic(
                'failed-services'
              )
            }
            disabled={
              diagnosticLoading !== null
            }
          >
            {diagnosticLoading ===
              'failed-services'
              ? 'Checking...'
              : 'Failed Services'
            }
          </button>

        </div>

        {diagnostic && (

          <div
            className={`control-diagnostic-result ${diagnostic.status}`}
          >

            <div className="control-diagnostic-result-header">

              <div>

                <span>
                  DIAGNOSTIC RESULT
                </span>

                <h3>
                  {diagnostic.title}
                </h3>

              </div>


              <strong
                className={`diagnostic-overall ${diagnostic.status}`}
              >
                {diagnostic.status === 'healthy'
                  ? '✓ HEALTHY'
                  : diagnostic.status === 'warning'
                    ? '⚠ WARNING'
                    : '✕ ERROR'
                }
              </strong>

            </div>


                       <div className="control-diagnostic-items">

              {diagnostic.items?.map(
                (item, index) => (

                  <div
                    className={`control-diagnostic-item ${item.status}`}
                    key={`${item.label}-${index}`}
                  >

                    <div className="diagnostic-item-status">

                      <span>
                        {item.status === 'ok'
                          ? '✓'
                          : item.status === 'warning'
                            ? '!'
                            : '×'
                        }
                      </span>

                    </div>


                    <div className="diagnostic-item-copy">

                      <strong>
                        {item.label}
                      </strong>

                      {item.detail && (
                        <small>
                          {item.detail}
                        </small>
                      )}

                    </div>


                    <div className="diagnostic-item-value">
                      {item.value}
                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </section>


      {/* =====================================================
          PUSH NOTIFICATIONS
          ===================================================== */}

      <section className="control-section control-push-section">

        <div className="control-section-title">

          <div>

            <Bell size={18} />

            <div>

              <span>
                NOTIFICATIONS
              </span>

              <h2>
                Push notifications
              </h2>

            </div>

          </div>

        </div>


        <div className="control-push-panel">

          <div className="control-push-status-grid">

            <div className="control-push-status">

              <span>
                BROWSER
              </span>

              <strong
                className={
                  pushSupported
                    ? 'push-good'
                    : 'push-bad'
                }
              >
                {pushSupported
                  ? 'SUPPORTED'
                  : 'UNAVAILABLE'
                }
              </strong>

            </div>


            <div className="control-push-status">

              <span>
                PERMISSION
              </span>

              <strong
                className={
                  pushPermission === 'granted'
                    ? 'push-good'
                    : pushPermission === 'denied'
                      ? 'push-bad'
                      : 'push-idle'
                }
              >
                {pushPermission === 'granted'
                  ? 'GRANTED'
                  : pushPermission === 'denied'
                    ? 'BLOCKED'
                    : pushPermission === 'unsupported'
                      ? 'UNAVAILABLE'
                      : 'NOT ASKED'
                }
              </strong>

            </div>


            <div className="control-push-status">

              <span>
                THIS DEVICE
              </span>

              <strong
                className={
                  pushSubscribed
                    ? 'push-good'
                    : 'push-idle'
                }
              >
                {pushSubscribed
                  ? 'ACTIVE'
                  : 'NOT SUBSCRIBED'
                }
              </strong>

            </div>


            <div className="control-push-status">

              <span>
                SAVED ENDPOINTS
              </span>

              <strong className="push-count">
                {pushServerCount}
              </strong>

            </div>

          </div>


          <div className="control-push-actions">

            {!pushSubscribed ? (

              <button
                type="button"
                className="control-push-button primary"
                disabled={
                  pushLoading
                  || !pushSupported
                }
                onClick={
                  enablePushNotifications
                }
              >
                <Bell size={16} />

                {pushLoading
                  ? 'Working...'
                  : 'Enable Notifications'
                }

              </button>

            ) : (

              <button
                type="button"
                className="control-push-button secondary"
                disabled={pushLoading}
                onClick={
                  disablePushNotifications
                }
              >
                <Square size={14} />

                Disable Notifications

              </button>

            )}


            <button
              type="button"
              className="control-push-button test"
              disabled={
                pushLoading
                || !pushSubscribed
              }
              onClick={sendPushTest}
            >
              <Play size={15} />

              Send Test Notification

            </button>

          </div>


          {pushMessage && (

            <div className="control-push-message success">
              <CheckCircle2 size={15} />
              {pushMessage}
            </div>

          )}


          {pushError && (

            <div className="control-push-message error">
              {pushError}
            </div>

          )}


          <p className="control-push-note">
            Alerts can arrive while the SUREEPI PWA is closed.
            The device only needs internet access to receive them.
          </p>

        </div>

      </section>


      {/* =====================================================
          SYSTEM POWER
          ===================================================== */}

      <section className="control-section control-power-section">

        <div className="control-section-title">

          <div>

            <Server size={18} />

            <div>

              <span>
                SYSTEM POWER
              </span>

              <h2>
                Node controls
              </h2>

            </div>

          </div>

        </div>


        <div className="control-power-grid">

          <button
            type="button"
            className="control-power-card restart"
            onClick={() =>
              setPowerConfirm('reboot')
            }
          >

            <div className="control-power-icon">
              <RefreshCw size={22} />
            </div>

            <div>

              <strong>
                Restart Raspberry Pi
              </strong>

              <span>
                Safely restart the entire
                SUREEPI node.
              </span>

            </div>

          </button>


          <button
            type="button"
            className="control-power-card shutdown"
            onClick={() =>
              setPowerConfirm('shutdown')
            }
          >

            <div className="control-power-icon">
              <Server size={22} />
            </div>

            <div>

              <strong>
                Shutdown Raspberry Pi
              </strong>

              <span>
                Safely power off the entire
                SUREEPI node.
              </span>

            </div>

          </button>

        </div>

      </section>


      {/* =====================================================
          POWER CONFIRMATION MODAL
          ===================================================== */}

      {(
        powerConfirm === 'reboot'
        || powerConfirm === 'shutdown'
      ) && (

        <div className="control-modal-backdrop">

          <div className="control-modal">

            <span className="control-modal-kicker">
              SYSTEM POWER
            </span>

            <h2>
              {powerConfirm === 'reboot'
                ? 'Restart Raspberry Pi?'
                : 'Shutdown Raspberry Pi?'
              }
            </h2>


            <p>
              {powerConfirm === 'reboot'
                ? (
                  <>
                    The SUREEPI dashboard and
                    all services will be
                    temporarily unavailable
                    while the node restarts.
                  </>
                )
                : (
                  <>
                    The SUREEPI node will
                    completely power off and
                    will require manual
                    power-on.
                  </>
                )
              }
            </p>


            {powerError && (

              <div className="control-power-error">
                {powerError}
              </div>

            )}


            <div className="control-modal-actions">

              <button
                type="button"
                className="control-modal-cancel"
                disabled={powerLoading}
                onClick={() => {
                  setPowerConfirm(null)
                  setPowerError(null)
                }}
              >
                Cancel
              </button>


              <button
                type="button"
                className={
                  powerConfirm === 'shutdown'
                    ? 'control-modal-confirm danger'
                    : 'control-modal-confirm'
                }
                disabled={powerLoading}
                onClick={runPowerAction}
              >

                {powerLoading
                  ? 'Executing...'
                  : powerConfirm === 'reboot'
                    ? 'Restart Node'
                    : 'Shutdown Node'
                }

              </button>

            </div>

          </div>

        </div>

      )}


    </div>
  )
}
