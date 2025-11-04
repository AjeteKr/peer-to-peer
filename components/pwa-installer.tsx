"use client"

import { useEffect } from "react"

export function PWAInstaller() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    }

    // Handle install prompt
    let deferredPrompt: any
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      
      // Show install button or banner
      showInstallBanner()
    })

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed')
      hideInstallBanner()
    })

    function showInstallBanner() {
      // Create install banner
      const banner = document.createElement('div')
      banner.id = 'install-banner'
      banner.className = 'fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50 flex items-center justify-between'
      banner.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-2xl">📱</div>
          <div>
            <div class="font-semibold text-sm">Install BookSwap</div>
            <div class="text-xs opacity-90">Get the full app experience</div>
          </div>
        </div>
        <div class="flex gap-2">
          <button id="install-btn" class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-medium transition-colors">
            Install
          </button>
          <button id="dismiss-btn" class="opacity-60 hover:opacity-100 text-lg transition-opacity">
            ×
          </button>
        </div>
      `
      
      document.body.appendChild(banner)
      
      // Handle install button click
      document.getElementById('install-btn')?.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt()
          const { outcome } = await deferredPrompt.userChoice
          console.log(`User response to the install prompt: ${outcome}`)
          deferredPrompt = null
          hideInstallBanner()
        }
      })
      
      // Handle dismiss button click
      document.getElementById('dismiss-btn')?.addEventListener('click', () => {
        hideInstallBanner()
      })
    }

    function hideInstallBanner() {
      const banner = document.getElementById('install-banner')
      if (banner) {
        banner.remove()
      }
    }
  }, [])

  return null
}

// Hook for checking if app is running as PWA
export function useIsPWA() {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    // @ts-ignore
    window.navigator.standalone ||
    document.referrer.includes('android-app://')
  )
}