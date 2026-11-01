import tls from 'node:tls'
import crypto from 'node:crypto'

const SMTP_HOST = 'smtppro.zoho.in'
const SMTP_PORT = 465
const SMTP_USER = process.env.ZOHO_SMTP_USER || 'contact@icebergdb.in'
const SMTP_PASS = process.env.ZOHO_SMTP_PASS || 'B8KM1pRAbHkT'
const OTP_SECRET = process.env.OTP_HMAC_SECRET || 'iceberg_otp_sovereign_secret_2026_v1'

const QDRANT_URL = 'https://65ad5c99-43a3-4de8-b9cb-6a1425ed843a.eu-central-1-0.aws.cloud.qdrant.io'
const QDRANT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIiwic3ViamVjdCI6ImFwaS1rZXk6Yjk3MzA3MzgtNjI2ZS00ZDM5LTllOWItYjRlNTE2MzdhZjcwIn0.GTvP7VVwnsDUw3N-MYpqEVuS2aH2nZ6GoMNvACmILqs'

function sha256Hex(str) {
  return crypto.createHash('sha256').update(str).digest('hex')
}

function emailToVaultPointId(email) {
  const hash = crypto.createHash('md5').update(`ib_vault_user_${email.trim().toLowerCase()}`).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}

function deriveDefaultApiKey(email) {
  const clean = email.trim().toLowerCase()
  if (clean === 'anku4104@gmail.com') {
    return 'ib_QPODmlKFjvtgwsrLzUg6y_xwCMASyvUqoZ55ST7XgM4'
  }
  const digest = crypto.createHash('sha256').update(`iceberg_v1_account_${clean}_permanent`).digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `ib_${digest}`
}

async function getVaultAccount(email) {
  const pid = emailToVaultPointId(email)
  try {
    const r = await fetch(`${QDRANT_URL}/collections/_memory_ankush_bot/points/${pid}`, {
      method: 'GET',
      headers: { 'api-key': QDRANT_KEY, 'Content-Type': 'application/json' }
    })
    if (!r.ok) return null
    const data = await r.json()
    return data?.result?.payload || null
  } catch {
    return null
  }
}

async function saveVaultAccount(email, payloadUpdate, preloadedExisting = undefined) {
  const clean = email.trim().toLowerCase()
  const pid = emailToVaultPointId(clean)
  const existing = preloadedExisting !== undefined ? (preloadedExisting || {}) : ((await getVaultAccount(clean)) || {})
  const merged = {
    ...existing,
    _sys_type: 'auth_vault',
    email: clean,
    updated_at: Math.floor(Date.now() / 1000),
    ...payloadUpdate
  }
  if (!merged.api_key) {
    merged.api_key = deriveDefaultApiKey(clean)
  }
  if (!merged.user_id) {
    merged.user_id = pid
  }
  if (!merged.project_id) {
    merged.project_id = `proj_${pid.slice(0, 8)}`
  }
  const zeroVec = new Array(384).fill(0.001)
  await fetch(`${QDRANT_URL}/collections/_memory_ankush_bot/points?wait=true`, {
    method: 'PUT',
    headers: { 'api-key': QDRANT_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      points: [{ id: pid, vector: zeroVec, payload: merged }]
    })
  })
  return merged
}

function sendZohoSmtpEmail({ to, subject, html, fromName = 'Iceberg Security' }) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(SMTP_PORT, SMTP_HOST, { servername: SMTP_HOST }, () => {})
    socket.setTimeout(10000)

    let buffer = ''
    let step = 0
    const msgId = `<${crypto.randomUUID()}@icebergdb.in>`
    const dateHdr = new Date().toUTCString()

    const commands = [
      `EHLO icebergdb.in`,
      `AUTH LOGIN`,
      Buffer.from(SMTP_USER).toString('base64'),
      Buffer.from(SMTP_PASS).toString('base64'),
      `MAIL FROM:<${SMTP_USER}>`,
      `RCPT TO:<${to}>`,
      `DATA`,
      [
        `Date: ${dateHdr}`,
        `Message-ID: ${msgId}`,
        `From: "${fromName}" <${SMTP_USER}>`,
        `To: <${to}>`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        `X-Priority: 1 (Highest)`,
        `Importance: High`,
        ``,
        html,
        `.`
      ].join('\r\n'),
      `QUIT`
    ]

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf-8')
      const lines = buffer.split('\r\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line) continue
        if (line.length >= 4 && line[3] === '-') continue
        const code = parseInt(line.slice(0, 3), 10)
        if (code >= 400) {
          socket.destroy()
          return reject(new Error(`SMTP Error ${code}: ${line}`))
        }
        if (step < commands.length) {
          const cmd = commands[step++]
          socket.write(cmd + '\r\n')
        } else {
          socket.end()
          return resolve(true)
        }
      }
    })

    socket.on('timeout', () => {
      socket.destroy()
      reject(new Error('SMTP connection timed out'))
    })

    socket.on('error', (err) => {
      reject(err)
    })
  })
}

function buildWelcomeEmailHtml({ email }) {
  const accountEmail = email || 'your account'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:560px;margin:32px auto;padding:36px 36px 28px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">

    <!-- Header -->
    <div style="padding-bottom:20px;margin-bottom:26px;border-bottom:1px solid #e2e8f0;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <img src="https://dashboard.icebergdb.in/logo.png" alt="Iceberg DB" width="28" height="28" style="display:block;width:28px;height:28px;border-radius:6px;border:0;" />
                </td>
                <td style="vertical-align:middle;">
                  <span style="font-size:17px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">Iceberg DB</span>
                </td>
              </tr>
            </table>
          </td>
          <td align="right" style="vertical-align:middle;">
            <a href="https://dashboard.icebergdb.in" style="font-size:12px;font-weight:500;color:#475569;text-decoration:none;">Cloud Console &nearr;</a>
          </td>
        </tr>
      </table>
    </div>

    <!-- Title & Lead -->
    <h1 style="font-size:21px;font-weight:600;margin:0 0 12px;color:#0f172a;letter-spacing:-0.01em;">Welcome to Iceberg DB</h1>
    <p style="color:#334155;font-size:14px;line-height:1.65;margin:0 0 22px;">
      Welcome to Iceberg DB &mdash; the high-performance vector database and memory engine for production AI applications and autonomous agents. Your cloud workspace has been provisioned and is ready to use.
    </p>

    <!-- Workspace Summary Table -->
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 18px;margin-bottom:24px;">
      <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:12px;">Workspace Summary</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:13px;">
        <tr>
          <td style="padding:5px 0;color:#64748b;width:38%;">Account</td>
          <td style="padding:5px 0;color:#0f172a;font-weight:500;">${accountEmail}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#64748b;">Current Plan</td>
          <td style="padding:5px 0;color:#0f172a;font-weight:500;">Free Tier (100,000 Vectors)</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#64748b;">Primary Region</td>
          <td style="padding:5px 0;color:#0f172a;font-weight:500;">Hosted in India (ap-south-1)</td>
        </tr>
        <tr>
          <td style="padding:5px 0;color:#64748b;">Status</td>
          <td style="padding:5px 0;color:#16a34a;font-weight:600;">&#9679; Active</td>
        </tr>
      </table>
    </div>

    <!-- Primary CTA Button -->
    <div style="margin-bottom:28px;">
      <a href="https://dashboard.icebergdb.in" style="display:inline-block;background-color:#0f172a;color:#ffffff;text-decoration:none;padding:11px 22px;border-radius:7px;font-size:14px;font-weight:500;">Open Cloud Console &rarr;</a>
    </div>

    <!-- Resources Section -->
    <div style="border-top:1px solid #e2e8f0;padding-top:22px;margin-bottom:24px;">
      <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:12px;">Resources to Get You Started</div>
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-size:13px;line-height:1.6;color:#475569;">
        <tr>
          <td style="padding:0 0 10px 0;">
            &bull; <a href="https://icebergdb.in/docs" style="color:#2563eb;text-decoration:none;font-weight:500;">Documentation &amp; Quickstart</a> &mdash; Learn how to index collections, run sub-15ms hybrid RRF search, and configure 4-tier agent memory.
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 10px 0;">
            &bull; <a href="https://icebergdb.in/docs" style="color:#2563eb;text-decoration:none;font-weight:500;">Official SDKs</a> &mdash; Connect using our official client libraries for Python, JavaScript/TypeScript, Rust, and .NET.
          </td>
        </tr>
        <tr>
          <td style="padding:0;">
            &bull; <a href="https://dashboard.icebergdb.in/apikeys" style="color:#2563eb;text-decoration:none;font-weight:500;">API Keys &amp; Security</a> &mdash; Generate and manage role-based project API keys from your console.
          </td>
        </tr>
      </table>
    </div>

    <!-- Sign-off -->
    <div style="border-top:1px solid #e2e8f0;padding-top:20px;margin-bottom:22px;font-size:13px;line-height:1.65;color:#475569;">
      If you have any questions or need assistance with your deployment, reply to this email or contact our team at <a href="mailto:contact@icebergdb.in" style="color:#2563eb;text-decoration:none;">contact@icebergdb.in</a>.
      <div style="margin-top:12px;color:#0f172a;font-weight:600;">&mdash; The Iceberg DB Team</div>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #f1f5f9;padding-top:16px;font-size:12px;color:#94a3b8;line-height:1.6;">
      &copy; 2026 Iceberg Database Technologies. All rights reserved.<br/>
      <a href="https://icebergdb.in" style="color:#64748b;text-decoration:none;">Website</a> &middot;
      <a href="https://icebergdb.in/docs" style="color:#64748b;text-decoration:none;">Documentation</a> &middot;
      <a href="https://icebergdb.in/status" style="color:#64748b;text-decoration:none;">System Status</a> &middot;
      <a href="https://icebergdb.in/privacy" style="color:#64748b;text-decoration:none;">Privacy Policy</a>
    </div>

  </div>
</body>
</html>`
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {})
    const { action } = body
    const cleanEmail = (body.email || '').trim().toLowerCase()

    if (!['google_auth', 'github_auth', 'microsoft_auth'].includes(action) && (!cleanEmail || !cleanEmail.includes('@'))) {
      return res.status(400).json({ detail: 'Please enter a valid email address' })
    }

    // Catch accidental "@4104gmail.com" typo
    const [localPart, domainPart] = cleanEmail.split('@')
    if (domainPart && /^\d+gmail\.com$/.test(domainPart)) {
      const numPrefix = domainPart.replace('gmail.com', '')
      return res.status(400).json({
        detail: `Did you mean ${localPart}${numPrefix}@gmail.com? Please check the '@' position.`
      })
    }

    // 1. SEND 6-DIGIT OTP EMAIL
    if (action === 'send_otp') {
      const otp = String(crypto.randomInt(100000, 999999))
      const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
      const payloadStr = `${cleanEmail}|${otp}|${expiresAt}`
      const sig = crypto.createHmac('sha256', OTP_SECRET).update(payloadStr).digest('hex')
      const otpToken = `${expiresAt}.${sig}`

      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <div style="max-width:520px;margin:32px auto;padding:36px 32px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
    <div style="padding-bottom:20px;margin-bottom:24px;border-bottom:1px solid #f1f5f9;">
      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
        <tr>
          <td style="vertical-align:middle;padding-right:10px;">
            <img src="https://dashboard.icebergdb.in/logo.png" alt="Iceberg DB" width="28" height="28" style="display:block;width:28px;height:28px;border-radius:6px;border:0;" />
          </td>
          <td style="vertical-align:middle;">
            <span style="font-size:17px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">Iceberg DB</span>
          </td>
        </tr>
      </table>
    </div>
    <h2 style="font-size:20px;font-weight:600;margin:0 0 12px;color:#0f172a;letter-spacing:-0.01em;">Reset your password</h2>
    <p style="color:#334155;font-size:14px;line-height:1.65;margin:0 0 24px;">
      Enter the 6-digit verification code below on the Iceberg dashboard to set your new password. This code is valid for <strong>10 minutes</strong>.
    </p>
    <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;font-weight:600;">Verification Code</div>
      <div style="font-size:32px;font-weight:700;letter-spacing:0.25em;color:#0f172a;font-family:monospace;">${otp}</div>
    </div>
    <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 24px;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
    <div style="border-top:1px solid #f1f5f9;padding-top:16px;font-size:12px;color:#94a3b8;">
      Iceberg Database Technologies &middot; <a href="https://icebergdb.in" style="color:#64748b;text-decoration:none;">icebergdb.in</a>
    </div>
  </div>
</body>
</html>`

      await sendZohoSmtpEmail({
        to: cleanEmail,
        subject: `${otp} is your Iceberg password reset code`,
        html
      })

      return res.status(200).json({
        ok: true,
        otp_token: otpToken,
        message: `6-digit verification code sent to ${cleanEmail}`
      })
    }

    // 2. VERIFY OTP & SAVE NEW PASSWORD
    if (action === 'verify_and_reset') {
      const otp = String(body.otp || '').trim()
      const otpToken = String(body.otp_token || '').trim()
      const newPassword = String(body.new_password || '')

      if (!otp || otp.length !== 6) {
        return res.status(400).json({ detail: 'Please enter the 6-digit verification code' })
      }
      if (
        newPassword.length < 8 ||
        !/[a-zA-Z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword)
      ) {
        return res.status(400).json({
          detail: 'Password must be at least 8 characters and include letters, a number (0-9), and a symbol (@#$)'
        })
      }

      const [expStr, providedSig] = otpToken.split('.')
      const expiresAt = parseInt(expStr, 10)
      if (!expiresAt || !providedSig || Date.now() > expiresAt) {
        return res.status(400).json({ detail: 'Verification code has expired. Please request a new code.' })
      }

      const expectedSig = crypto.createHmac('sha256', OTP_SECRET)
        .update(`${cleanEmail}|${otp}|${expiresAt}`)
        .digest('hex')

      if (expectedSig !== providedSig) {
        return res.status(400).json({ detail: 'Invalid 6-digit verification code. Please check your email and try again.' })
      }

      const passwordHash = sha256Hex(newPassword)
      const saved = await saveVaultAccount(cleanEmail, {
        password_hash: passwordHash,
        last_password_reset_at: new Date().toISOString(),
        api_key: body.existing_api_key || undefined
      })

      return res.status(200).json({
        ok: true,
        user_id: saved.user_id,
        email: cleanEmail,
        api_key: saved.api_key,
        project_id: saved.project_id,
        api_keys: [{
          id: `key_${saved.user_id.slice(0, 8)}`,
          key_prefix: saved.api_key.slice(0, 10),
          name: 'Default Key',
          role: 'admin',
          project_id: saved.project_id
        }],
        projects: [{ id: saved.project_id, name: 'default', description: 'Default project' }],
        message: 'Password updated successfully'
      })
    }

    // 3. SYNC SIGNUP / LOGIN WITH CLOUD AUTH VAULT
    if (action === 'sync_account') {
      const password = String(body.password || '')
      const existingAcc = await getVaultAccount(cleanEmail)
      const shouldSendWelcome = !existingAcc && cleanEmail !== 'anku4104@gmail.com'

      const saved = await saveVaultAccount(
        cleanEmail,
        {
          password_hash: password ? sha256Hex(password) : undefined,
          api_key: body.api_key || undefined,
          user_id: body.user_id || undefined,
          project_id: body.project_id || undefined,
          welcome_sent: shouldSendWelcome ? true : existingAcc?.welcome_sent,
          pending_welcome: false
        },
        existingAcc
      )

      if (shouldSendWelcome) {
        await sendZohoSmtpEmail({
          to: cleanEmail,
          fromName: 'Iceberg DB',
          subject: 'Welcome to Iceberg DB',
          html: buildWelcomeEmailHtml({
            email: cleanEmail,
            name: saved.name || body.name || '',
            apiKey: saved.api_key
          })
        }).catch(() => {})
      }

      return res.status(200).json({ ok: true, account: saved, welcome_sent: shouldSendWelcome })
    }

    // 4. CLOUD VAULT LOGIN VERIFICATION
    if (action === 'cloud_login') {
      const password = String(body.password || '')
      const acc = await getVaultAccount(cleanEmail)
      if (!acc) {
        return res.status(404).json({
          code: 'ACCOUNT_NOT_FOUND',
          detail: 'No account found with this email. Please create an account first.'
        })
      }
      if (!acc.password_hash) {
        return res.status(401).json({
          code: 'GOOGLE_ACCOUNT_ONLY',
          detail: 'This account was created with Google. Please click "Continue with Google" or use Forgot password.'
        })
      }
      if (acc.password_hash !== sha256Hex(password)) {
        return res.status(401).json({
          code: 'INVALID_PASSWORD',
          detail: 'Incorrect password. Please try again.'
        })
      }
      return res.status(200).json({
        ok: true,
        user_id: acc.user_id,
        email: cleanEmail,
        api_key: acc.api_key,
        project_id: acc.project_id,
        api_keys: [{
          id: `key_${(acc.user_id || 'default').slice(0, 8)}`,
          key_prefix: (acc.api_key || '').slice(0, 10),
          name: 'Default Key',
          role: 'admin',
          project_id: acc.project_id
        }],
        projects: [{ id: acc.project_id, name: 'default', description: 'Default project' }]
      })
    }

    // 5. OAUTH & SOCIAL AUTHENTICATION (Google / GitHub / Microsoft — OAuth Code or Verified OTP)
    if (action === 'google_auth' || action === 'github_auth' || action === 'microsoft_auth') {
      const provider = action === 'github_auth' ? 'github' : action === 'microsoft_auth' ? 'microsoft' : (body.provider || 'google')
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '964987445228-3uua959noudb4qqf3afj49m2g5k84m6n.apps.googleusercontent.com'
      const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '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'
      const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || ''
      const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || ''
      const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID || ''
      const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET || ''

      let verifiedEmail = cleanEmail
      let googleName = body.name || ''
      let googlePicture = body.picture || ''
      let accessToken = body.google_access_token || ''

      // 5A. GitHub OAuth Code Exchange
      if (body.github_code && GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
        const ghTokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code: body.github_code,
            redirect_uri: body.redirect_uri || 'https://dashboard.icebergdb.in/login'
          })
        })
        const ghTokenData = await ghTokenRes.json().catch(() => ({}))
        if (!ghTokenData.access_token) {
          return res.status(401).json({ detail: ghTokenData.error_description || 'Could not exchange GitHub authorization code' })
        }
        const [uRes, eRes] = await Promise.all([
          fetch('https://api.github.com/user', { headers: { Authorization: `Bearer ${ghTokenData.access_token}`, 'User-Agent': 'IcebergDB' } }),
          fetch('https://api.github.com/user/emails', { headers: { Authorization: `Bearer ${ghTokenData.access_token}`, 'User-Agent': 'IcebergDB' } })
        ])
        const uData = await uRes.json().catch(() => ({}))
        const eData = await eRes.json().catch(() => ([]))
        const primaryEmailObj = Array.isArray(eData) ? (eData.find(e => e.primary && e.verified) || eData.find(e => e.verified) || eData[0]) : null
        verifiedEmail = (primaryEmailObj?.email || uData.email || '').trim().toLowerCase()
        googleName = uData.name || uData.login || ''
        googlePicture = uData.avatar_url || ''
      }

      // 5B. Microsoft OAuth Code Exchange
      if (body.microsoft_code && MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET) {
        const msTokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: MICROSOFT_CLIENT_ID,
            client_secret: MICROSOFT_CLIENT_SECRET,
            code: body.microsoft_code,
            redirect_uri: body.redirect_uri || 'https://dashboard.icebergdb.in/login',
            grant_type: 'authorization_code'
          }).toString()
        })
        const msTokenData = await msTokenRes.json().catch(() => ({}))
        if (msTokenData.id_token) {
          try {
            const payloadB64 = msTokenData.id_token.split('.')[1]
            const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))
            verifiedEmail = (decoded.email || decoded.preferred_username || '').trim().toLowerCase()
            googleName = decoded.name || ''
          } catch {}
        }
      }

      // 5C. Exchange Google OAuth 2.0 Authorization Code for Access Token + ID Token
      if (body.google_code) {
        const redirectUri = body.redirect_uri || 'https://dashboard.icebergdb.in/login'
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: body.google_code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          }).toString()
        })
        const tokenData = await tokenRes.json()
        if (!tokenRes.ok || (!tokenData.access_token && !tokenData.id_token)) {
          return res.status(401).json({
            detail: tokenData.error_description || tokenData.error || 'Could not exchange Google authorization code'
          })
        }
        // Fast-path: decode Google ID Token JWT directly in 0ms without needing a second network roundtrip
        if (tokenData.id_token) {
          try {
            const payloadB64 = tokenData.id_token.split('.')[1]
            const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'))
            if (decoded.email) {
              verifiedEmail = decoded.email.trim().toLowerCase()
              googleName = decoded.name || ''
              googlePicture = decoded.picture || ''
            }
          } catch {}
        }
        accessToken = tokenData.access_token || ''
      }

      if (!verifiedEmail && accessToken) {
        const gRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        if (!gRes.ok) {
          return res.status(401).json({ detail: 'Could not verify Google account token' })
        }
        const gProfile = await gRes.json()
        verifiedEmail = (gProfile.email || '').trim().toLowerCase()
        googleName = gProfile.name || ''
        googlePicture = gProfile.picture || ''
      } else if (body.otp && body.otp_token) {
        const otp = String(body.otp || '').trim()
        const [expStr, providedSig] = String(body.otp_token || '').split('.')
        const expiresAt = parseInt(expStr, 10)
        if (!expiresAt || !providedSig || Date.now() > expiresAt) {
          return res.status(400).json({ detail: 'Verification code expired. Please try again.' })
        }
        const expectedSig = crypto.createHmac('sha256', OTP_SECRET)
          .update(`${verifiedEmail}|${otp}|${expiresAt}`)
          .digest('hex')
        if (expectedSig !== providedSig) {
          return res.status(400).json({ detail: 'Invalid 6-digit verification code' })
        }
      } else if (body.trusted_token) {
        const [expStr, providedSig] = String(body.trusted_token || '').split('.')
        const expectedSig = crypto.createHmac('sha256', OTP_SECRET)
          .update(`google_trusted|${verifiedEmail}|${expStr}`)
          .digest('hex')
        if (expectedSig !== providedSig) {
          return res.status(401).json({ detail: 'Session expired, please verify your account' })
        }
      }

      if (!verifiedEmail) {
        return res.status(400).json({ detail: 'Missing verification credentials' })
      }

      const authMode = body.mode || 'signup'
      const isKnownOnDevice = Array.isArray(body.known_emails) && body.known_emails.includes(verifiedEmail)
      const existingAcc = await getVaultAccount(verifiedEmail)

      const pid = emailToVaultPointId(verifiedEmail)
      const defaultKey = deriveDefaultApiKey(verifiedEmail)
      const fallbackSaved = {
        user_id: pid,
        email: verifiedEmail,
        name: googleName || verifiedEmail.split('@')[0],
        picture: googlePicture || '',
        api_key: defaultKey,
        project_id: `proj_${pid.slice(0, 8)}`
      }

      const shouldSendGoogleWelcome = !existingAcc && verifiedEmail !== 'anku4104@gmail.com'

      const saved = await saveVaultAccount(
        verifiedEmail,
        {
          auth_provider: provider,
          name: googleName || undefined,
          picture: googlePicture || undefined,
          last_login_at: new Date().toISOString(),
          welcome_sent: shouldSendGoogleWelcome ? true : existingAcc?.welcome_sent,
          pending_welcome: false
        },
        existingAcc
      ).catch(() => fallbackSaved)

      if (shouldSendGoogleWelcome) {
        await sendZohoSmtpEmail({
          to: verifiedEmail,
          fromName: 'Iceberg DB',
          subject: 'Welcome to Iceberg DB',
          html: buildWelcomeEmailHtml({
            email: verifiedEmail,
            name: saved.name || googleName || '',
            apiKey: saved.api_key
          })
        }).catch(() => {})
      }

      // Issue a 30-day trusted Quick-Login token for 1-click sign-in on this browser
      const trustExp = Date.now() + 30 * 24 * 60 * 60 * 1000
      const trustSig = crypto.createHmac('sha256', OTP_SECRET)
        .update(`google_trusted|${verifiedEmail}|${trustExp}`)
        .digest('hex')

      return res.status(200).json({
        ok: true,
        user_id: saved.user_id,
        email: verifiedEmail,
        name: saved.name || verifiedEmail.split('@')[0],
        picture: saved.picture || '',
        api_key: saved.api_key,
        project_id: saved.project_id,
        trusted_token: `${trustExp}.${trustSig}`,
        api_keys: [{
          id: `key_${saved.user_id.slice(0, 8)}`,
          key_prefix: saved.api_key.slice(0, 10),
          name: 'Default Key',
          role: 'admin',
          project_id: saved.project_id
        }],
        projects: [{ id: saved.project_id, name: 'default', description: 'Default project' }]
      })
    }

    return res.status(400).json({ detail: 'Unknown action' })
  } catch (err) {
    return res.status(500).json({ detail: err?.message || 'Internal server error' })
  }
}
