import { useEffect, useRef, useState } from 'react'
import Logo from '../components/Logo'
import ConstellationField from '../components/ConstellationField'
import { supabase } from '../supabaseClient'

// Where the mobile app can be deep-linked back into once the web confirmation
// has finished (adjust to match your app's actual URL scheme / associated domain).
const APP_DEEP_LINK = 'konex://auth/callback'
const APP_STORE_URL = 'https://apps.apple.com/app/konex'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.konex.app'

export default function AuthCallback() {
  const [status, setStatus] = useState('pending') // 'pending' | 'success' | 'error'
  const [message, setMessage] = useState('Confirming your email…')
  const settled = useRef(false)

  useEffect(() => {
    let timeout

    async function resolve() {
      const url = new URL(window.location.href)
      const search = url.searchParams
      // Supabase sometimes returns implicit-flow params after a `#` instead of `?`
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))

      const errorDescription =
        search.get('error_description') || hashParams.get('error_description') || search.get('error')
      if (errorDescription) {
        finish('error', decodeURIComponent(errorDescription.replace(/\+/g, ' ')))
        return
      }

      const tokenHash = search.get('token_hash')
      const type = search.get('type')
      const code = search.get('code')

      try {
        if (tokenHash && type) {
          // Newer Supabase email-link flow: /auth/callback?token_hash=...&type=signup
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
          if (error) throw error
          finish('success')
          return
        }

        if (code) {
          // PKCE flow: /auth/callback?code=...
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          finish('success')
          return
        }

        if (hashParams.get('access_token')) {
          // Implicit flow: supabase-js's detectSessionInUrl picks this up on load.
          // Give it a moment, then confirm via getSession().
          const { data, error } = await supabase.auth.getSession()
          if (error) throw error
          if (data.session) {
            finish('success')
            return
          }
        }

        // Nothing recognizable in the URL at all.
        finish('error', 'This confirmation link is missing or incomplete.')
      } catch (err) {
        finish('error', err?.message || 'That link is invalid or has expired.')
      }
    }

    function finish(nextStatus, err) {
      if (settled.current) return
      settled.current = true
      clearTimeout(timeout)
      setStatus(nextStatus)
      setMessage(nextStatus === 'error' ? err : '')
    }

    // Safety net in case none of the branches above resolve in time.
    timeout = setTimeout(() => {
      finish('error', 'That link is invalid or has expired. Request a new one from the app.')
    }, 8000)

    resolve()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="callback-screen">
      <ConstellationField />
      <div className="wrap">
        <nav className="nav">
          <a className="brand" href="/">
            <Logo />
            <span className="brand-word">KONEX</span>
          </a>
        </nav>
      </div>

      <div className="callback-center">
        <div className="card">
          {status === 'pending' && <PendingCard />}
          {status === 'success' && <SuccessCard />}
          {status === 'error' && <ErrorCard message={message} />}
        </div>
      </div>
    </div>
  )
}

function PendingCard() {
  return (
    <>
      <div className="status-mark">
        <SpinnerMark />
      </div>
      <span className="status-tag pending">Verifying</span>
      <h1>Confirming your email…</h1>
      <p className="desc">Give it a second — this usually takes less than a moment.</p>
    </>
  )
}

function SuccessCard() {
  return (
    <>
      <div className="status-mark">
        <CheckMark />
      </div>
      <span className="status-tag ok">Verified</span>
      <h1>Email verified successfully</h1>
      <p className="desc">
        Your Konex account is confirmed. Open the app to finish signing in — if you
        already have it installed, we'll try to jump you straight there.
      </p>
      <div className="card-ctas">
        <a className="btn btn-primary" href={APP_DEEP_LINK}>Open Konex</a>
        <a className="btn btn-ghost" href={APP_STORE_URL}>Get it on the App Store</a>
        <a className="btn btn-ghost" href={PLAY_STORE_URL}>Get it on Google Play</a>
      </div>
      <div className="deep-link">{APP_DEEP_LINK}</div>
    </>
  )
}

function ErrorCard({ message }) {
  return (
    <>
      <div className="status-mark">
        <ErrorMark />
      </div>
      <span className="status-tag err">Link issue</span>
      <h1>Couldn't verify that link</h1>
      <p className="desc">{message || 'That confirmation link is invalid or has expired.'}</p>
      <div className="card-ctas">
        <a className="btn btn-primary" href={APP_STORE_URL}>Open Konex to resend</a>
        <a className="btn btn-ghost" href="mailto:support@konex-app-rho.vercel.app">Contact support</a>
      </div>
    </>
  )
}

function SpinnerMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="19" stroke="#26263c" strokeWidth="3" fill="none" />
      <circle cx="24" cy="24" r="19" stroke="#8c6bff" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="30 90">
        <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="0.9s" repeatCount="indefinite" />
      </circle>
    </svg>
  )
}

function CheckMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="19" fill="rgba(77,255,180,0.1)" stroke="#4dffb4" strokeWidth="2" />
      <path d="M15 24.5 L21 30.5 L33 17.5" fill="none" stroke="#4dffb4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ErrorMark() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="19" fill="rgba(255,106,106,0.1)" stroke="#ff6a6a" strokeWidth="2" />
      <path d="M17 17 L31 31 M31 17 L17 31" stroke="#ff6a6a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
