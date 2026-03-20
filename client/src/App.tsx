import { useState } from 'react'
import './App.css'
import { socket } from './lib/socket'
import { Button } from './components/ui/button'

function App() {
  const [routerId, setRouterId] = useState<string | null>(null)
  const [meetingError, setMeetingError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  function startMeeting() {
    setStarting(true)
    setRouterId(null)
    setMeetingError(null)

    const timeout = setTimeout(() => {
      setMeetingError('Request timed out. Is the server running?')
      setStarting(false)
    }, 8000)

    socket.emit('create-router', (res: { routerId?: string; error?: string }) => {
      clearTimeout(timeout)
      setStarting(false)
      if (res?.routerId) {
        setRouterId(res.routerId)
      } else {
        setMeetingError(res?.error ?? 'Unknown error')
      }
    })
  }

  return (
    <div className="app">
      <h1>Mediasoup Sample</h1>
      <Button onClick={startMeeting} disabled={starting}>
        {starting ? 'Starting…' : 'Start Meeting'}
      </Button>
      {routerId && (
        <p className="router-id">Router ID: <code>{routerId}</code></p>
      )}
      {meetingError && (
        <p className="error">{meetingError}</p>
      )}

    </div>
  )
}

export default App
