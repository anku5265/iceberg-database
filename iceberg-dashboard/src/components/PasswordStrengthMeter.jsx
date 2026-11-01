export function validatePasswordStrength(password = '') {
  const hasMinLen = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)
  const notRepeating = password.length > 0 && !/^(.)\1+$/.test(password)

  const score = [hasMinLen, hasLetter, hasNumber, hasSymbol].filter(Boolean).length
  const isValid = hasMinLen && hasLetter && hasNumber && hasSymbol && notRepeating

  let label = 'Enter a password'
  let color = 'text-[#666]'
  let barColor = 'bg-[#2a2a2a]'

  if (password.length > 0) {
    if (!notRepeating) {
      label = 'Too repetitive (avoid 11111111)'
      color = 'text-red-400'
      barColor = 'bg-red-500'
    } else if (score <= 1) {
      label = 'Weak password'
      color = 'text-red-400'
      barColor = 'bg-red-500'
    } else if (score === 2) {
      label = 'Fair password'
      color = 'text-amber-400'
      barColor = 'bg-amber-500'
    } else if (score === 3) {
      label = 'Good — 1 more check needed'
      color = 'text-blue-400'
      barColor = 'bg-blue-500'
    } else if (isValid) {
      label = 'Strong password ✓'
      color = 'text-emerald-400'
      barColor = 'bg-emerald-500'
    }
  }

  return { hasMinLen, hasLetter, hasNumber, hasSymbol, notRepeating, score, isValid, label, color, barColor }
}

export default function PasswordStrengthMeter({ password = '' }) {
  if (!password) return null
  const { hasMinLen, hasLetter, hasNumber, hasSymbol, score, barColor } = validatePasswordStrength(password)

  const items = [
    { ok: hasMinLen, text: '8+ chars' },
    { ok: hasLetter, text: 'a–Z' },
    { ok: hasNumber, text: '0–9' },
    { ok: hasSymbol, text: '@#$' }
  ]

  return (
    <div className="mt-2.5 space-y-2">
      {/* 4-Segment Strength Bar perfectly aligned with the 4 pills below */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1 rounded-full transition-all duration-200 ${
              score >= step ? barColor : 'bg-[#222]'
            }`}
          />
        ))}
      </div>

      {/* Single-Line 4 Requirement Pills */}
      <div className="grid grid-cols-4 gap-1.5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`text-[11px] font-medium py-1 px-1.5 rounded-md border flex items-center justify-center gap-1 whitespace-nowrap transition-all duration-200 ${
              item.ok
                ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-300'
                : 'bg-[#0d0d0d] border-[#222] text-[#666]'
            }`}
          >
            <span className="text-[10px] leading-none">{item.ok ? '✓' : '○'}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
