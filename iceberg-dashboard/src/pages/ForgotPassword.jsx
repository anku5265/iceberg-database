import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import IcebergLogo from '../components/IcebergLogo'
import PasswordStrengthMeter, { validatePasswordStrength } from '../components/PasswordStrengthMeter'
import { trackFounderEvent, deriveAccountKey } from '../lib/api'

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState(() => searchParams.get('email') || '')
  const [step, setStep] = useState(1) // 1 = request OTP, 2 = enter OTP + new password
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSendCode = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setInfo('')
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    // Auto-detect accidental "@4104gmail.com" typo before even calling server
    const [localPart, domainPart] = cleanEmail.split('@')
    if (domainPart && /^\d+gmail\.com$/.test(domainPart)) {
      const numPrefix = domainPart.replace('gmail.com', '')
      const suggested = `${localPart}${numPrefix}@gmail.com`
      setError(`Typo detected in email domain! Did you mean ${suggested}?`)
      return
    }

    // Instant <0.1s optimistic screen transition so user never waits on button!
    setStep(2)
    setInfo(`Sending 6-digit code to ${cleanEmail}...`)

    try {
      const r = await fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_otp', email: cleanEmail })
      })
      const data = await r.json()
      if (!r.ok) {
        setStep(1)
        setInfo('')
        setError(data.detail || 'Could not send verification code. Please check your email.')
        return
      }
      setOtpToken(data.otp_token)
      setInfo(`6-digit code sent to ${cleanEmail}`)
      trackFounderEvent('forgot_password_otp_sent', { email: cleanEmail })
    } catch {
      setStep(1)
      setInfo('')
      setError('Network error while sending code. Please try again.')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError('')
    const cleanEmail = email.trim().toLowerCase()
    const cleanOtp = otp.trim()

    if (cleanOtp.length !== 6) {
      setError('Please enter the 6-digit code sent to your email')
      return
    }

    const strength = validatePasswordStrength(newPassword)
    if (!strength.isValid) {
      setError('Please complete all 4 password strength requirements below')
      return
    }

    if (!otpToken) {
      setError('Still delivering your code, please wait 1 second and try again')
      return
    }

    setLoading(true)
    try {
      const savedMap = JSON.parse(localStorage.getItem('iceberg_account_keys') || '{}')
      const existingKey = savedMap[cleanEmail] || undefined

      const r = await fetch('/api/auth-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_and_reset',
          email: cleanEmail,
          otp: cleanOtp,
          otp_token: otpToken,
          new_password: newPassword,
          existing_api_key: existingKey
        })
      })
      const data = await r.json()
      if (!r.ok) {
        setError(data.detail || 'Invalid or expired verification code')
        setLoading(false)
        return
      }

      const fullKey = data.api_key || existingKey || await deriveAccountKey(cleanEmail, newPassword)
      savedMap[cleanEmail] = fullKey
      localStorage.setItem('iceberg_account_keys', JSON.stringify(savedMap))
      localStorage.setItem('iceberg_user', JSON.stringify(data))
      localStorage.setItem('iceberg_api_key', fullKey)
      localStorage.setItem('iceberg_api_key_prefix', fullKey.slice(0, 10))
      localStorage.setItem('iceberg_project_id', data.project_id || '')

      trackFounderEvent('password_reset_success', { email: cleanEmail })
      navigate('/')
    } catch {
      setError('Could not reset password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <IcebergLogo className="w-14 h-14 mx-auto mb-3" />
          <div className="text-2xl font-semibold text-white mb-1">Iceberg</div>
          <div className="text-[#666] text-sm">
            {step === 1 ? 'Reset your account password' : 'Enter 6-digit verification code'}
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendCode} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
            <div>
              <label className="text-[#888] text-xs mb-1.5 block">Account Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]"
              />
              <p className="text-[#555] text-[11px] mt-1.5">
                We will send an instant 6-digit verification code to your email inbox.
              </p>
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-md transition"
            >
              Send reset code
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="bg-[#111] border border-[#222] rounded-xl p-6 space-y-4">
            {info && (
              <div className="bg-blue-500/10 border border-blue-500/25 rounded-lg px-3 py-2 text-xs text-blue-300 flex items-center justify-between">
                <span>{info}</span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[11px] text-blue-400 underline ml-2 shrink-0"
                >
                  Change
                </button>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#888] text-xs">6-Digit Verification Code</label>
                <button
                  type="button"
                  onClick={handleSendCode}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition"
                >
                  Resend code
                </button>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 text-white text-center font-mono text-lg tracking-[0.35em] focus:outline-none focus:border-blue-600 placeholder-[#333]"
              />
            </div>

            <div>
              <label className="text-[#888] text-xs mb-1.5 block">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-md px-3 py-2.5 pr-10 text-white text-sm focus:outline-none focus:border-blue-600 placeholder-[#444]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#aaa] transition"
                >
                  {showPassword
                    ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              <PasswordStrengthMeter password={newPassword} />
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-md transition"
            >
              {loading ? 'Updating password...' : 'Reset password & Sign in'}
            </button>
          </form>
        )}

        <p className="text-center text-[#555] text-sm mt-4">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 transition">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
