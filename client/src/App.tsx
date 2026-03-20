import { useRef, useState, useEffect } from 'react'
import './App.css'
import { socket } from './lib/socket'
import { startMeeting, consumeRemote } from './lib/meeting'
import type { MeetingResult } from './lib/meeting'
import { Button } from './components/ui/button'
import { Mic, MicOff, VideoIcon, VideoOff } from 'lucide-react'

function App() {
  const [notification, setNotification] = useState<string | null>(null)
  async function handleJoinMeeting() {
    setState('starting')
    setMeetingError(null)
    try {
      const joinRes = await new Promise<{ success?: boolean; error?: string }>((resolve) => {
        const timeout = setTimeout(() => resolve({ error: 'Request timed out' }), 8000)
        socket.emit('join-room', { roomId: joinRoomId.trim() }, (res: { success?: boolean; error?: string }) => {
          clearTimeout(timeout)
          resolve(res)
        })
      })
      if (joinRes.error || !joinRes.success) {
        throw new Error(joinRes.error ?? 'Failed to join room')
      }
      setRouterId(joinRoomId.trim())
      setParticipants([{ id: typeof socket.id === 'string' ? socket.id : '', isSelf: true }])
      
      socket.off('peer-joined')
      socket.off('peer-left')
      // Listen for peer-joined/peer-left events
      socket.on('peer-joined', ({ peerId }) => {
        setParticipants((prev) => prev.some(p => p.id === peerId) ? prev : [...prev, { id: peerId, isSelf: false }])
        setNotification(`Participant joined: ${peerId.slice(-6)}`)
        setTimeout(() => setNotification(null), 3000)
      })
      socket.on('peer-left', ({ peerId }) => {
        setParticipants((prev) => prev.filter(p => p.id !== peerId))
        setNotification(`Participant left: ${peerId.slice(-6)}`)
        setTimeout(() => setNotification(null), 3000)
      })
      const result = await startMeeting(joinRoomId.trim(), socket)
      meetingRef.current = result
      setState('active')
    } catch (err) {
      setMeetingError(err instanceof Error ? err.message : String(err))
      setState('idle')
    }
  }
  const [state, setState] = useState<'idle' | 'starting' | 'active'>('idle')
  const [meetingError, setMeetingError] = useState<string | null>(null)
  const [audioMuted, setAudioMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [routerId, setRouterId] = useState<string | null>(null)
  const [joinRoomId, setJoinRoomId] = useState('')
  // Multi-participant state
  const [participants, setParticipants] = useState<{ id: string; isSelf: boolean; stream?: MediaStream }[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<{ [peerId: string]: HTMLVideoElement | null }>({})
  const meetingRef = useRef<MeetingResult | null>(null)
  
  // Track consumed producers so we don't consume audio/video twice
  const consumedProducersRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (state === 'active' && videoRef.current && meetingRef.current) {
      videoRef.current.srcObject = meetingRef.current.stream
    }
  }, [state])

  // Fetch and consume remote producers when meeting becomes active or participants change
  useEffect(() => {
    if (state !== 'active' || !routerId || !meetingRef.current) return;
    // Get remote producer IDs
    async function fetchAndConsume() {
      const res = await new Promise<{ producers: { producerId: string, peerId: string }[], error?: string }>((resolve) => {
        socket.emit('get-producers', { roomId: routerId }, (r: any) => resolve(r));
      });
      
      if (res.error || !res.producers) {
        console.error('get-producers returned error:', res);
        return;
      }
      
      // For each producer, consume if not already present
      for (const { producerId, peerId } of res.producers) {
        if (!consumedProducersRef.current.has(producerId)) {
          consumedProducersRef.current.add(producerId);
          try {
            if (!meetingRef.current || !routerId) continue;
            const stream = await consumeRemote(socket, meetingRef.current.device, routerId as string, producerId);
            
            setParticipants(prev => {
              const existingIndex = prev.findIndex(p => p.id === peerId);
              if (existingIndex >= 0) {
                const existing = prev[existingIndex];
                let newStream = stream;
                if (existing.stream) {
                  // Merge existing tracks with the new stream's tracks
                  const existingTracks = existing.stream.getTracks();
                  const newTracks = stream.getTracks().filter(nt => 
                    !existingTracks.some(et => et.kind === nt.kind && et.id === nt.id)
                  );
                  newStream = new MediaStream([...existingTracks, ...newTracks]);
                }
                const newArr = [...prev];
                newArr[existingIndex] = { ...existing, stream: newStream };
                return newArr;
              } else {
                // If this is the highest-level state introduction to this peer, add them fully.
                return [...prev, { id: peerId, isSelf: false, stream }];
              }
            });
          } catch (err) {
            console.error('Consume error:', err);
          }
        }
      }
    }
    
    fetchAndConsume();
    const intervalId = setInterval(fetchAndConsume, 2000);
    
    return () => clearInterval(intervalId);
  }, [state, routerId]); // Removed participants from deps to prevent interval reset on every join

  async function handleStartMeeting() {
    setState('starting')
    setMeetingError(null)

    try {
        setParticipants([{ id: typeof socket.id === 'string' ? socket.id : '', isSelf: true }])
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

      const joinRes = await new Promise<{ success?: boolean; error?: string }>((resolve) => {
        const timeout = setTimeout(() => resolve({ error: 'Request timed out' }), 8000)
        socket.emit('join-room', { roomId: routerRes.routerId }, (res: { success?: boolean; error?: string }) => {
          clearTimeout(timeout)
          resolve(res)
        })
      })

      if (joinRes.error || !joinRes.success) {
        throw new Error(joinRes.error ?? 'Failed to join room')
      }

      setRouterId(routerRes.routerId)
      setParticipants([{ id: typeof socket.id === 'string' ? socket.id : '', isSelf: true }])
      
      socket.off('peer-joined')
      socket.off('peer-left')
      // Listen for peer-joined/peer-left events
      socket.on('peer-joined', ({ peerId }) => {
        setParticipants((prev) => prev.some(p => p.id === peerId) ? prev : [...prev, { id: peerId, isSelf: false }])
        setNotification(`Participant joined: ${peerId.slice(-6)}`)
        setTimeout(() => setNotification(null), 3000)
      })
      socket.on('peer-left', ({ peerId }) => {
        setParticipants((prev) => prev.filter(p => p.id !== peerId))
        setNotification(`Participant left: ${peerId.slice(-6)}`)
        setTimeout(() => setNotification(null), 3000)
      })
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
    <div className="min-h-screen relative flex flex-col bg-neutral-50 dark:bg-[#0a0a0a] overflow-hidden text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/20 blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none mix-blend-screen"></div>

      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-xl border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white shadow-2xl z-50 animate-in slide-in-from-top-4 fade-in duration-300 font-medium tracking-wide flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          {notification}
        </div>
      )}

      {routerId && state === 'active' && (
        <div className="absolute top-6 left-6 z-40 bg-white/50 dark:bg-black/40 backdrop-blur-md border border-neutral-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-lg flex items-center gap-3 transition-all">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <p className="text-sm font-medium text-neutral-700 dark:text-white">Room: <code className="font-mono text-xs bg-black/5 dark:bg-black/50 px-2 py-1 rounded text-indigo-600 dark:text-purple-300 ml-1">{routerId}</code></p>
        </div>
      )}

      {state !== 'active' && (
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-md mx-auto relative z-10 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-linear-to-br from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500 bg-clip-text text-transparent">
              Mediasoup Sample
            </h1>
          </div>
          <div className="w-full bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-neutral-200 dark:border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col gap-6 relative overflow-hidden transition-all duration-500 hover:shadow-purple-500/10 hover:border-purple-500/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-purple-500 via-indigo-500 to-cyan-500"></div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Join Meeting</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">Enter a room ID or create a new meeting instantly.</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange={e => setJoinRoomId(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-white transition-all shadow-sm"
                disabled={state === 'starting'}
              />
              <Button 
                onClick={handleJoinMeeting} 
                className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-lg hover:shadow-indigo-500/25"
                disabled={state === 'starting' || !joinRoomId.trim()}
              >
                Join Existing Meeting
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-200 dark:border-neutral-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#fbfcff] dark:bg-[#0c0c0c] px-3 font-semibold text-neutral-400">Or</span></div>
            </div>

            <Button 
              onClick={handleStartMeeting} 
              variant="outline"
              className="w-full py-6 rounded-xl border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer"
              disabled={state === 'starting'}
            >
              {state === 'starting' ? 'Starting…' : 'Start New Meeting'}
            </Button>
          </div>
          {meetingError && (
             <div className="mt-6 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium w-full text-center">
               {meetingError}
             </div>
          )}
        </div>
      )}

      {state === 'active' && (
        <div className="flex-1 w-full h-full p-4 md:p-8 pt-24 flex flex-col items-center justify-center relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-4 w-full max-w-[1400px] h-full max-h-[85vh]">
            {participants.map((p) => (
              <div key={p.id} className="relative overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl group flex items-center justify-center h-full w-full">
                {p.isSelf ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ minHeight: '100%', minWidth: '100%' }}
                  />
                ) : p.stream ? (
                  <video
                    ref={el => {
                      remoteVideoRefs.current[p.id] = el;
                      if (el && p.stream && el.srcObject !== p.stream) {
                        el.srcObject = p.stream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ minHeight: '100%', minWidth: '100%' }}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-neutral-400 gap-3">
                    <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-xl font-medium border border-neutral-700 shadow-inner">
                      {p.id.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium tracking-wide">Connecting...</span>
                  </div>
                )}
                
                {/* Peer ID Badge */}
                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-white border border-white/10 shadow-lg">
                  {p.isSelf ? 'You' : `Peer ${p.id.slice(-4)}`}
                </div>

                {/* Local Controls overlay inside the local video tile */}
                {p.isSelf && (
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button 
                      onClick={toggleAudio} 
                      variant={audioMuted ? "destructive" : "secondary"} 
                      size="icon" 
                      className={`rounded-full h-10 w-10 shadow-lg transition-all cursor-pointer ${!audioMuted && 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/10'}`}
                    >
                      {audioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button 
                      onClick={toggleVideo} 
                      variant={videoOff ? "destructive" : "secondary"} 
                      size="icon" 
                      className={`rounded-full h-10 w-10 shadow-lg transition-all cursor-pointer ${!videoOff && 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/10'}`}
                    >
                      {videoOff ? <VideoOff className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
