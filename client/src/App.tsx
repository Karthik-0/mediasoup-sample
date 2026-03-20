import { useRef, useState, useEffect } from 'react'
import './App.css'
import { socket } from './lib/socket'
import { startMeeting } from './lib/meeting'
import type { MeetingResult } from './lib/meeting'
import { Button } from './components/ui/button'

function App() {
  const [state, setState] = useState<'idle' | 'starting' | 'active'>('idle')
  const [meetingError, setMeetingError] = useState<string | null>(null)
  const [audioMuted, setAudioMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [routerId, setRouterId] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const meetingRef = useRef<MeetingResult | null>(null)

  useEffect(() => {
    if (state === 'active' && videoRef.current && meetingRef.current) {
      videoRef.current.srcObject = meetingRef.current.stream
    }
  }, [state])

  async function handleStartMeeting() {
    setState('starting')
    setMeetingError(null)

    try {
      // Create router via existing socket event
      const routerRes = await new Promise<{ routerId?: string; error?: string }>((resolve) => {
        const timeout = setTimeout(() => resolve({ error: 'Request timed out' }), 8000)
        socket.emit('create-router', (res: { routerId?: string; error?: string }) => {
          clearTimeout(timeout)
          resolve(res)
        })
      })

      if (routerRes.error || !routerRes.routerId) {
        throw new Error(routerRes.error ?? 'Failed to create router')
      }

      setRouterId(routerRes.routerId)
      const result = await startMeeting(routerRes.routerId, socket)
      meetingRef.current = result
      setState('active')
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : String(err))
      setState('idle')
    }
  }

  function toggleAudio() {
    const meeting = meetingRef.current
    if (!meeting) return
    const track = meeting.stream.getAudioTracks()[0]
    if (audioMuted) {
      meeting.audioProducer.resume()
      if (track) track.enabled = true
      setAudioMuted(false)
    } else {
      meeting.audioProducer.pause()
      if (track) track.enabled = false
      setAudioMuted(true)
    }
  }

  function toggleVideo() {
    const meeting = meetingRef.current
    if (!meeting) return
    const track = meeting.stream.getVideoTracks()[0]
    if (videoOff) {
      meeting.videoProducer.resume()
      if (track) track.enabled = true
      setVideoOff(false)
    } else {
      meeting.videoProducer.pause()
      if (track) track.enabled = false
      setVideoOff(true)
    }
  }

  return (
    <div className="app">
      <h1>Mediasoup Sample</h1>

      {routerId && (
        <p className="router-id">Room ID: <code>{routerId}</code></p>
      )}

      {state !== 'active' && (
        <Button onClick={handleStartMeeting} disabled={state === 'starting'}>
          {state === 'starting' ? 'Starting…' : 'Start Meeting'}
        </Button>
      )}

      {meetingError && <p className="error">{meetingError}</p>}

      {state === 'active' && (
        <div className="meeting">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="local-video"
          />
          <div className="controls">
            <Button onClick={toggleAudio} variant="outline">
              {audioMuted ? 'Unmute' : 'Mute'}
            </Button>
            <Button onClick={toggleVideo} variant="outline">
              {videoOff ? 'Camera On' : 'Camera Off'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
