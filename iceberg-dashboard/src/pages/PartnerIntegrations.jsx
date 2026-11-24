import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { API_URL } from '../lib/config'

export default function PartnerIntegrations({ forceCreate = false }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(() => forceCreate || searchParams.get('create') === '1')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [returnMechanism, setReturnMechanism] = useState('web_message')
  const [originsText, setOriginsText] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [sdkTab, setSdkTab] = useState('python')

  const apiKey = () => localStorage.getItem('iceberg_api_key') || ''

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/partner-integrations`, {
        headers: { 'X-API-Key': apiKey() },
      })
      if (res.ok) {
        const data = await res.json()
        const list = data.integrations || []
        setItems(list)
        try {
          localStorage.setItem('ib_partner_integrations_count', String(list.length))
          window.dispatchEvent(new Event('iceberg-partner-integrations-updated'))
        } catch {}
      }
    } catch {
      // Ignore network fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIntegrations()
  }, [])

  useEffect(() => {
    if (forceCreate || searchParams.get('create') === '1') {
      setShowCreate(true)
    }
  }, [forceCreate, searchParams])

  const openCreateModal = () => {
    setError('')
    setShowCreate(true)
  }

  const closeCreateModal = () => {
    setShowCreate(false)
    if (location.pathname === '/integrations/create') {
      navigate('/integrations', { replace: true })
      return
    }
    if (searchParams.has('create')) {
      searchParams.delete('create')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const handleCreate = async e => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const allowedOrigins =
        returnMechanism === 'web_message'
          ? originsText
              .split(/[\n,]+/)
              .map(s => s.trim())
              .filter(Boolean)
          : []

      const res = await fetch(`${API_URL}/partner-integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey(),
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          logo_url: logoUrl.trim(),
          return_mechanism: returnMechanism,
          allowed_origins: allowedOrigins,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create integration. Ensure you are using an admin API key.')
      }

      setName('')
      setSlug('')
      setLogoUrl('')
      setReturnMechanism('web_message')
      setOriginsText('')
      closeCreateModal()
      loadIntegrations()
    } catch (err) {
      setError(err.message || 'Unable to create integration.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async targetSlug => {
    try {
      const res = await fetch(`${API_URL}/partner-integrations/${encodeURIComponent(targetSlug)}`, {
        method: 'DELETE',
        headers: { 'X-API-Key': apiKey() },
      })
      if (res.ok) {
        setItems(prev => {
          const next = prev.filter(x => x.slug !== targetSlug)
          try {
            localStorage.setItem('ib_partner_integrations_count', String(next.length))
            window.dispatchEvent(new Event('iceberg-partner-integrations-updated'))
          } catch {}
          return next
        })
      }
    } catch {}
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 sm:px-10 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-primary)]">Integrations</h1>
          <p className="text-[13.5px] text-[var(--text-secondary)] mt-1">
            Create an <code className="font-mono text-[12.5px]">integrationId</code> for the Connect to Iceberg popup and embeddable widget.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2 rounded-[4px] bg-[#1d6bf3] hover:bg-[#2563eb] text-white text-[13.5px] font-semibold cursor-pointer transition"
        >
          Create Integration
        </button>
      </div>

      {showCreate && (
        <div className="mb-8 rounded-[6px] border border-[var(--border2)] bg-[var(--card-bg)] p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-[var(--border)]">
            <h2 className="text-[17px] font-bold text-[var(--text-primary)]">Create integration</h2>
            <button
              type="button"
              onClick={closeCreateModal}
              className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300 text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">
                  Integration name <span className="text-rose-400">*</span>
                </label>
                <p className="text-[12px] text-[var(--text-secondary)] mb-2">A display name for your integration.</p>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    const v = e.target.value
                    setName(v)
                    if (!slug) {
                      setSlug(
                        v
                          .toLowerCase()
                          .replace(/[^a-z0-9_-]+/g, '-')
                          .replace(/^-+|-+$/g, '')
                      )
                    }
                  }}
                  placeholder="Acme AI Studio"
                  className="w-full px-3.5 py-2 rounded border border-[var(--border2)] bg-[var(--bg-base)] text-[var(--text-primary)] text-[13.5px] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">
                  URL Slug (<code className="font-mono text-[12px]">integrationId</code>) <span className="text-rose-400">*</span>
                </label>
                <p className="text-[12px] text-[var(--text-secondary)] mb-2">
                  Public unique identifier used in URLs. Cannot be changed after creation.
                </p>
                <input
                  type="text"
                  required
                  pattern="[A-Za-z0-9][A-Za-z0-9_-]{1,63}"
                  value={slug}
                  onChange={e => setSlug(e.target.value.replace(/[^A-Za-z0-9_-]/g, ''))}
                  placeholder="myApp"
                  className="w-full px-3.5 py-2 rounded border border-[var(--border2)] bg-[var(--bg-base)] font-mono text-[var(--text-primary)] text-[13.5px] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">Logo</label>
              <p className="text-[12px] text-[var(--text-secondary)] mb-2">A logo for your integration (upload an image or paste an image URL).</p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://app.example.com/logo.svg"
                  className="flex-1 px-3.5 py-2 rounded border border-[var(--border2)] bg-[var(--bg-base)] text-[var(--text-primary)] text-[13.5px] focus:outline-none focus:border-[#3b82f6]"
                />
                <label className="px-3.5 py-2 rounded border border-[var(--border2)] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] text-[12.5px] font-medium text-[var(--text-primary)] cursor-pointer text-center shrink-0">
                  Upload logo
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/jpeg,image/webp"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      if (file.size > 256 * 1024) {
                        setError('Logo file must be under 256 KB.')
                        return
                      }
                      const reader = new FileReader()
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setLogoUrl(reader.result)
                        }
                      }
                      reader.readAsDataURL(file)
                    }}
                  />
                </label>
                {logoUrl && (
                  <img src={logoUrl} alt="Preview" className="w-8 h-8 rounded object-contain bg-white/10 border border-[var(--border2)] shrink-0" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-2">
                Return mechanism
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`rounded border p-3.5 cursor-pointer transition ${
                    returnMechanism === 'web_message'
                      ? 'border-[#3b82f6] bg-[#1d6bf3]/10'
                      : 'border-[var(--border2)] bg-[var(--bg-base)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)]">
                    <input
                      type="radio"
                      name="ret_mech"
                      checked={returnMechanism === 'web_message'}
                      onChange={() => setReturnMechanism('web_message')}
                      className="accent-[#3b82f6]"
                    />
                    <span>Web Message</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1 pl-5">
                    Sends the generated API key via browser postMessage to allowed origins (use with ConnectPopup or embed.js).
                  </p>
                </label>

                <label
                  className={`rounded border p-3.5 cursor-pointer transition ${
                    returnMechanism === 'copy_paste'
                      ? 'border-[#3b82f6] bg-[#1d6bf3]/10'
                      : 'border-[var(--border2)] bg-[var(--bg-base)]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-[13.5px] text-[var(--text-primary)]">
                    <input
                      type="radio"
                      name="ret_mech"
                      checked={returnMechanism === 'copy_paste'}
                      onChange={() => setReturnMechanism('copy_paste')}
                      className="accent-[#3b82f6]"
                    />
                    <span>Copy/Paste</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1 pl-5">
                    Displays the generated API key in the success screen so users can copy and paste it manually.
                  </p>
                </label>
              </div>
            </div>

            {returnMechanism === 'web_message' && (
              <div>
                <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">
                  Allowed origin
                </label>
                <p className="text-[12px] text-[var(--text-secondary)] mb-2">
                  URL origins where your integration is hosted (protocol, hostname, and port — comma or newline separated). Leave empty during local testing to allow any origin.
                </p>
                <textarea
                  rows={2}
                  value={originsText}
                  onChange={e => setOriginsText(e.target.value)}
                  placeholder="https://app.example.com, http://localhost:3000"
                  className="w-full px-3.5 py-2 rounded border border-[var(--border2)] bg-[var(--bg-base)] font-mono text-[var(--text-primary)] text-[13px] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeCreateModal}
                className="px-4 py-2 rounded border border-[var(--border2)] text-[13px] font-medium text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded bg-[#1d6bf3] hover:bg-[#2563eb] disabled:opacity-50 text-white text-[13.5px] font-semibold cursor-pointer"
              >
                {saving ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-[6px] border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[13.5px] text-[var(--text-secondary)]">Loading integrations...</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-[15px] font-semibold text-[var(--text-primary)] mb-1.5">No integrations registered yet</div>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-md mx-auto mb-5">
              Create your first integration ID to embed the Connect to Iceberg popup or widget in your app or notebook.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded bg-[#1d6bf3] hover:bg-[#2563eb] text-white text-[13px] font-semibold cursor-pointer"
            >
              Create Integration
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b border-[var(--border)] text-[12px] uppercase tracking-wider text-[var(--text-secondary)]">
                  <th className="py-3 px-5">Integration Name</th>
                  <th className="py-3 px-4">integrationId (Slug)</th>
                  <th className="py-3 px-4">Return Mechanism</th>
                  <th className="py-3 px-4">Allowed Origins</th>
                  <th className="py-3 px-4">Attributed Requests</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map(it => (
                  <tr key={it.id}>
                    <td className="py-3.5 px-5 font-semibold text-[var(--text-primary)] flex items-center gap-2.5">
                      {it.logo_url && (
                        <img src={it.logo_url} alt="" className="w-5 h-5 rounded object-contain bg-white/10" />
                      )}
                      <span>{it.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12.5px] text-[#60a5fa]">{it.slug}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {it.return_mechanism === 'copy_paste' ? 'Copy/Paste' : 'Web Message'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12px] text-[var(--text-secondary)]">
                      {it.return_mechanism === 'copy_paste'
                        ? '--'
                        : it.allowed_origins?.length
                        ? it.allowed_origins.join(', ')
                        : '* (All origins)'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[12.5px] text-[var(--text-primary)] tabular-nums">
                      {(it.attributed_requests || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-3">
                      <a
                        href={`/connect?integration=${encodeURIComponent(it.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[12.5px] font-medium text-[#60a5fa] hover:underline no-underline"
                      >
                        Test popup
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(it.slug)}
                        className="text-[12.5px] font-medium text-rose-400 hover:underline cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {items.length > 0 && (() => {
        const activeTag = items[0]?.slug || 'my_app'
        const snippets = {
          python: `from iceberg import Iceberg\n\nib = Iceberg(api_key="YOUR_API_KEY", source_tag="${activeTag}")`,
          javascript: `import { Iceberg } from 'icebergdb';\n\nconst ib = new Iceberg({ apiKey: 'YOUR_API_KEY', sourceTag: '${activeTag}' });`,
          java: `Iceberg ib = new Iceberg.Builder("YOUR_API_KEY")\n    .withSourceTag("${activeTag}")\n    .build();`,
          go: `client, err := iceberg.NewClient(iceberg.NewClientParams{\n    ApiKey:    "YOUR_API_KEY",\n    SourceTag: "${activeTag}",\n})`,
          rust: `use icebergdb::Iceberg;\n\nlet ib = Iceberg::new("YOUR_API_KEY").with_source_tag("${activeTag}");`,
          dotnet: `using Iceberg;\n\nvar ib = new IcebergClient(apiKey: "YOUR_API_KEY", sourceTag: "${activeTag}");`,
          curl: `curl -X GET "${API_URL}/collections" \\\n  -H "Api-Key: YOUR_API_KEY" \\\n  -H "User-Agent: source_tag=${activeTag}"`,
        }
        const tabLabels = [
          ['python', 'Python'],
          ['javascript', 'JavaScript'],
          ['java', 'Java'],
          ['go', 'Go'],
          ['rust', 'Rust'],
          ['dotnet', '.NET'],
          ['curl', 'curl'],
        ]
        return (
          <div className="mt-6 rounded-[6px] border border-[var(--border)] bg-[var(--card-bg)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 border-b border-[var(--border)] bg-[var(--bg-base)]">
              <div className="flex items-center gap-4 flex-wrap">
                {tabLabels.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSdkTab(id)}
                    className={`py-2.5 text-[12.5px] font-medium border-b-2 -mb-px cursor-pointer transition ${
                      sdkTab === id
                        ? 'border-[#3b82f6] text-[#60a5fa]'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="text-[11.5px] text-[var(--text-secondary)] font-mono">source_tag={activeTag}</span>
            </div>
            <pre className="p-4 overflow-x-auto font-mono text-[12.5px] leading-[1.6] text-[var(--text-primary)] m-0">
              {snippets[sdkTab]}
            </pre>
          </div>
        )
      })()}

      <div className="mt-5 text-[12.5px] text-[var(--text-secondary)]">
        Manage keys generated by user connections in <Link to="/apikeys" className="text-[#60a5fa] underline">API keys</Link>, view{' '}
        <a href="https://icebergdb.in/integrations/attribute-usage" target="_blank" rel="noreferrer" className="text-[#60a5fa] underline">
          Attribute usage across all 6 SDKs
        </a>
        , or view the{' '}
        <a href="https://icebergdb.in/integrations/connect-users" target="_blank" rel="noreferrer" className="text-[#60a5fa] underline">
          Connect your users to Iceberg documentation
        </a>
        .
      </div>
    </div>
  )
}
