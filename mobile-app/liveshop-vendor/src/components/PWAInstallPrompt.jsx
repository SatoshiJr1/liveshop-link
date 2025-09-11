import { useEffect, useState } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent))
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone) return null

  const onInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
  }

  return (
    <div className="fixed bottom-4 inset-x-0 px-4 z-[60]">
      <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur px-4 py-3 text-white shadow-xl">
        {isIOS ? (
          <div className="text-sm leading-5">
            <div className="font-semibold mb-1">Installer l’app</div>
            <div>Sur iOS: ouvrez dans Safari, touchez <span className="font-semibold">Partager</span> puis <span className="font-semibold">Sur l’écran d’accueil</span>.</div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              <div className="font-semibold">Installer l’app</div>
              <div className="text-white/70">Accès plus rapide, plein écran, et hors‑ligne.</div>
            </div>
            {isInstallable && (
              <button onClick={onInstallClick} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium">
                Installer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
