import { useState } from 'react'
import { CANONICAL_SPEC } from '../config/canonicalSpec'

export function CanonicalSdkTable({ dark = true }) {
  const [copiedId, setCopiedId] = useState('')

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 2000)
  }

  const borderCol = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)'
  const cardBg = dark ? '#0b0d13' : '#ffffff'
  const headerBg = dark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.025)'
  const textPrimary = dark ? '#ffffff' : '#111827'
  const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#4b5563'

  return (
    <div
      className="rounded-2xl overflow-hidden mt-8"
      style={{
        background: cardBg,
        border: `1px solid ${borderCol}`,
      }}
    >
      {/* Header Bar */}
      <div
        className="px-4 sm:px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ background: headerBg, borderColor: borderCol }}
      >
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold tracking-tight" style={{ color: textPrimary }}>
              Official Package Registry ({CANONICAL_SPEC.displayVersion})
            </h3>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {CANONICAL_SPEC.displayVersion} Verified
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: textMuted }}>
            Official packages across PyPI, npm, Crates.io, NuGet, pkg.go.dev, and Maven.
          </p>
        </div>
        <a
          href="/product/sdk"
          className="text-xs font-mono text-blue-400 hover:text-blue-300 transition shrink-0"
        >
          Full SDK Explorer →
        </a>
      </div>

      {/* Responsive Table (4 Clean Columns — Zero Horizontal Cutoff) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr
              className="border-b font-mono text-[11px] uppercase tracking-wider"
              style={{ borderColor: borderCol, color: textMuted, background: headerBg }}
            >
              <th className="py-3 px-4">Language</th>
              <th className="py-3 px-4">Package &amp; Registry</th>
              <th className="py-3 px-3">Version</th>
              <th className="py-3 px-4">Install Command</th>
            </tr>
          </thead>
          <tbody>
            {CANONICAL_SPEC.sdks.map((sdk) => {
              const isCopied = copiedId === sdk.id
              return (
                <tr
                  key={sdk.id}
                  className="border-b last:border-b-0 transition"
                  style={{ borderColor: borderCol }}
                >
                  <td className="py-3 px-4 font-semibold whitespace-nowrap" style={{ color: textPrimary }}>
                    <div>{sdk.language}</div>
                    <div className="text-[10px] font-mono font-normal mt-0.5" style={{ color: textMuted }}>
                      {sdk.verifiedEnv}
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <a
                      href={sdk.registryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 underline-offset-4 font-semibold break-all"
                    >
                      {sdk.packageName}
                    </a>
                    <span
                      className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-sans whitespace-nowrap"
                      style={{
                        background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                        color: textMuted,
                      }}
                    >
                      {sdk.registryName}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {sdk.displayVersion}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">
                    <div className="flex items-center justify-between gap-2">
                      <code
                        className="px-2.5 py-1 rounded text-[11px] select-all break-all"
                        style={{
                          background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                          color: dark ? '#e5e7eb' : '#111827',
                          border: `1px solid ${borderCol}`,
                        }}
                      >
                        {sdk.installCmd}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(sdk.id, sdk.installCmd)}
                        className="px-2.5 py-1 rounded text-[11px] font-mono font-medium transition cursor-pointer shrink-0"
                        style={{
                          background: isCopied
                            ? 'rgba(34,197,94,0.18)'
                            : dark
                            ? 'rgba(59,130,246,0.14)'
                            : 'rgba(37,99,235,0.1)',
                          color: isCopied ? '#4ade80' : '#60a5fa',
                          border: isCopied
                            ? '1px solid rgba(34,197,94,0.35)'
                            : '1px solid rgba(59,130,246,0.3)',
                        }}
                      >
                        {isCopied ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
export default CanonicalSdkTable
