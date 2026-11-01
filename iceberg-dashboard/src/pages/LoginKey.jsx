import { Navigate } from 'react-router-dom'

export default function LoginKey() {
  // Legacy API-key prompt removed: Email + Password login now provisions the session key automatically.
  return <Navigate to="/" replace />
}
