import { useRef, useState, useEffect, type MutableRefObject, type RefObject } from 'react'
import './App.css'
import { socket } from './lib/socket'
import { startMeeting, consumeRemote } from './lib/meeting'
import type { MeetingResult } from './lib/meeting'
import { Button } from './components/ui/button'
import { Mic, MicOff, VideoIcon, VideoOff, PhoneOff } from 'lucide-react'
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator'
import { spawnBot } from './lib/bot'
import type { BotHandle } from './lib/bot'

function ResourceMonitorCard({
  hardwareStats,
  myWorkerPid,
  inMeeting,
}: {
  hardwareStats: any;
  myWorkerPid: number | undefined;
  inMeeting: boolean;
}) {
  const [minimized, setMinimized] = useState(false);

  function workerCpuColor(pct: number) {
    if (pct > 80) return 'text-red-400';
    if (pct > 60) return 'text-yellow-400';
    return 'text-green-400';
  }

  function memPctColor(pct: number) {
    if (pct > 85) return 'text-red-400';
    if (pct > 70) return 'text-yellow-400';
    return 'text-green-400';
  }

  function loadColor(load: number) {
    if (load > 2.0) return 'text-red-400';
    if (load > 1.0) return 'text-yellow-400';
    return 'text-green-400';
  }

  const sys = hardwareStats?.systemStats;
  const workerStats: Array<{ pid: number; cpu: number; memory: number }> = hardwareStats?.workerStats ?? [];
  const memPct = sys ? Math.round((1 - sys.memFree / sys.memTotal) * 100) : null;
  const memTotalGB = sys ? (sys.memTotal / 1024 / 1024 / 1024).toFixed(1) : null;

  return (
    <div className="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl text-[10px] font-mono text-neutral-300 w-56">
      <div className="flex justify-between items-center px-3 py-2 border-b border-white/10">
        <span className="text-white font-bold tracking-wider text-[10px]">RESOURCE MONITOR</span>
        <button
          onClick={() => setMinimized(m => !m)}
          className="bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition-colors cursor-pointer text-[10px] leading-none"
        >
          {minimized ? '+' : '−'}
        </button>
      </div>
      {!minimized && (
        <div className="px-3 py-2 flex flex-col gap-2">
          <div>
            <div className="text-neutral-500 uppercase tracking-widest text-[9px] mb-1">System</div>
            <div className="flex justify-between">
              <span>CPU</span>
              {sys ? (
                <span className={loadColor(sys.cpuLoad)}>
                  {sys.cpuLoad.toFixed(2)}<span className="text-neutral-500 ml-1">load</span>
                </span>
              ) : <span className="text-neutral-500">—</span>}
            </div>
            <div className="flex justify-between">
              <span>MEM</span>
              {memPct !== null ? (
                <span className={memPctColor(memPct)}>
                  {memPct}%<span className="text-neutral-500 ml-1">{memTotalGB}GB</span>
                </span>
              ) : <span className="text-neutral-500">—</span>}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 uppercase tracking-widest text-[9px] mb-1">
              Workers ({workerStats.length})
            </div>
            {workerStats.length === 0 && <span className="text-neutral-500">—</span>}
            {workerStats.map((w) => {
              const isMine = w.pid === myWorkerPid;
              return (
                <div key={w.pid} className={`flex justify-between ${isMine ? 'text-cyan-300' : ''}`}>
                  <span>{isMine ? '● ' : '\u00a0\u00a0'}W{w.pid}</span>
                  <span className={workerCpuColor(w.cpu)}>{w.cpu.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
          <div>
            <div className="text-neutral-500 uppercase tracking-widest text-[9px] mb-1">Bandwidth</div>
            {inMeeting ? (
              <div className="flex justify-between">
                <span className="text-green-400">
                  ↑ {hardwareStats?.sendBitrate != null ? `${hardwareStats.sendBitrate} kbps` : '—'}
                </span>
                <span className="text-blue-400">
                  ↓ {hardwareStats?.recvBitrate != null ? `${hardwareStats.recvBitrate} kbps` : '—'}
                </span>
              </div>
            ) : (
              <span className="text-neutral-500">—</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BotPanel({
  roomId,
  botsRef,
  botCounterRef,
  fileInputRef,
  botCount,
  onCountChange,
}: {
  roomId: string;
  botsRef: MutableRefObject<BotHandle[]>;
  botCounterRef: MutableRefObject<number>;
  fileInputRef: RefObject<HTMLInputElement>;
  botCount: number;
  onCountChange: (n: number) => void;
}) {
  async function handleAddCanvasBot() {
    botCounterRef.current++;
    const botName = `Bot-${botCounterRef.current}`;
    try {
      const handle = await spawnBot(roomId, botName, { videoSource: 'canvas' }, botCounterRef.current);
      botsRef.current.push(handle);
      onCountChange(botsRef.current.length);
    } catch (err) {
      console.error('[BotPanel] canvas bot spawn error:', err);
    }
  }

  function handleAddVideoBot() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    botCounterRef.current++;
    const index = botCounterRef.current;
    const botName = `Bot-${index}`;
    try {
      const handle = await spawnBot(roomId, botName, { videoSource: file }, index);
      botsRef.current.push(handle);
      onCountChange(botsRef.current.length);
    } catch (err) {
      console.error('[BotPanel] video bot spawn error:', err);
    }
    e.target.value = '';
  }

  function handleRemoveAll() {
    botsRef.current.forEach(b => b.disconnect());
    botsRef.current = [];
    onCountChange(0);
  }

  return (
    <div className="bg-black/80 backdrop-blur-md border border-yellow-500/40 rounded-xl shadow-2xl text-[10px] font-mono text-neutral-300 w-56">
      <div className="flex justify-between items-center px-3 py-2 border-b border-white/10">
        <span className="text-yellow-400 font-bold tracking-wider text-[10px]">DEV BOTS</span>
        <span className="bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded text-[9px]">Bots: {botCount}</span>
      </div>
      <div className="px-3 py-2 flex flex-col gap-1.5">
        <button
          onClick={handleAddCanvasBot}
          className="w-full bg-white/10 hover:bg-white/20 px-2 py-1.5 rounded text-white transition-colors cursor-pointer text-[10px] text-left"
        >
          + Add Canvas Bot
        </button>
        <button
          onClick={handleAddVideoBot}
          className="w-full bg-white/10 hover:bg-white/20 px-2 py-1.5 rounded text-white transition-colors cursor-pointer text-[10px] text-left"
        >
          + Add Video Bot
        </button>
        {botCount > 0 && (
          <button
            onClick={handleRemoveAll}
            className="w-full bg-red-500/20 hover:bg-red-500/30 px-2 py-1.5 rounded text-red-300 transition-colors cursor-pointer text-[10px] text-left"
          >
            ✕ Remove All
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

function App() {
  const [notification, setNotification] = useState<string | null>(null)
  async function handleJoinMeeting() {
    setState('starting')
    setMeetingError(null)
    try {
      const generatedName = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], separator: ' ' });
      const finalUserName = userNameInput.trim() || generatedName;

      const joinRes = await new Promise<{ success?: boolean; routerId?: string; workerPid?: number, error?: string }>((resolve) => {
        const timeout = setTimeout(() => resolve({ error: 'Request timed out' }), 8000)
        socket.emit('join-room', { roomId: joinRoomId.trim(), userName: finalUserName }, (res: any) => {
          clearTimeout(timeout)
          resolve(res)
        })
      })
      if (joinRes.error || !joinRes.success) {
        throw new Error(joinRes.error ?? 'Failed to join room')
      }
      const assignedRouterId = joinRes.routerId || joinRoomId.trim();
      setRouterId(assignedRouterId)
      setParticipants([{ id: typeof socket.id === 'string' ? socket.id : '', isSelf: true, routerId: assignedRouterId, workerPid: joinRes.workerPid, userName: finalUserName }])
      
      socket.off('peer-joined')
      socket.off('peer-left')
      // Listen for peer-joined/peer-left events
      socket.on('peer-joined', ({ peerId, userName }) => {
        setParticipants((prev) => prev.some(p => p.id === peerId) ? prev : [...prev, { id: peerId, isSelf: false, userName }])
        setNotification(`${userName || peerId.slice(-6)} joined`)
        setTimeout(() => setNotification(null), 3000)
      })
      socket.on('peer-left', ({ peerId, userName }) => {
        setParticipants((prev) => prev.filter(p => p.id !== peerId))
        setNotification(`${userName || peerId.slice(-6)} left`)
        setTimeout(() => setNotification(null), 3000)
      })
      const result = await startMeeting(assignedRouterId, socket)
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
  const [userNameInput, setUserNameInput] = useState('')
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [hardwareStats, setHardwareStats] = useState<any>(null)
  // Multi-participant state
  const [participants, setParticipants] = useState<{ id: string; isSelf: boolean; stream?: MediaStream, routerId?: string, workerPid?: number, userName?: string }[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRefs = useRef<{ [peerId: string]: HTMLVideoElement | null }>({})
  const meetingRef = useRef<MeetingResult | null>(null)
  
  // Track consumed producers so we don't consume audio/video twice
  const consumedProducersRef = useRef<Set<string>>(new Set())
  // Accumulate recv transports for downlink bandwidth measurement
  const recvTransportsRef = useRef<any[]>([])
  // Previous byte counts for bitrate delta computation
  const prevBytesRef = useRef<{ sent: number; received: number; ts: number } | null>(null)

  // Bot simulator (dev-only)
  const botsRef = useRef<BotHandle[]>([])
  const botCounterRef = useRef(0)
  const botVideoFileInputRef = useRef<HTMLInputElement>(null)
  const [botCount, setBotCount] = useState(0)

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
      const res = await new Promise<{ producers: { producerId: string, peerId: string, peerName?: string, routerId?: string, workerPid?: number }[], error?: string }>((resolve) => {
        socket.emit('get-producers', { roomId: joinRoomId.trim() }, (r: any) => resolve(r));
      });
      
      if (res.error || !res.producers) {
        console.error('get-producers returned error:', res);
        return;
      }
      
      // For each producer, consume if not already present
      for (const { producerId, peerId, peerName, routerId: peerRouterId, workerPid } of res.producers) {
        if (!consumedProducersRef.current.has(producerId)) {
          consumedProducersRef.current.add(producerId);
          try {
            if (!meetingRef.current || !routerId) continue;
            const { stream, recvTransport } = await consumeRemote(socket, meetingRef.current.device, routerId as string, producerId);
            recvTransportsRef.current.push(recvTransport);

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
                newArr[existingIndex] = { ...existing, stream: newStream, routerId: peerRouterId, workerPid, userName: peerName || existing.userName };
                return newArr;
              } else {
                // If this is the highest-level state introduction to this peer, add them fully.
                return [...prev, { id: peerId, isSelf: false, stream, routerId: peerRouterId, workerPid, userName: peerName }];
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
  }, [state, routerId, joinRoomId]); // Removed participants from deps to prevent interval reset on every join

// startMeeting is completely deprecated and collapsed natively into handleJoinMeeting above

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

  // Poll server for system and all-worker stats every 3s
  useEffect(() => {
    const statsInterval = setInterval(() => {
      socket.emit('get-stats', {}, (res: any) => {
        if (res && !res.error) {
          setHardwareStats((prev: any) => ({
            ...(prev ?? {}),
            systemStats: res.systemStats,
            workerStats: res.workerStats,
          }));
        }
      });
    }, 3000);
    return () => clearInterval(statsInterval);
  }, []);

  // Poll RTCPeerConnection stats for bandwidth when in a meeting
  useEffect(() => {
    if (state !== 'active') return;
    const bwInterval = setInterval(async () => {
      const sendTransport = meetingRef.current?.sendTransport;
      if (!sendTransport) return;
      try {
        let totalBytesSent = 0;
        const sendStats = await sendTransport.getStats();
        sendStats.forEach((report: any) => {
          if (report.type === 'outbound-rtp' && typeof report.bytesSent === 'number') {
            totalBytesSent += report.bytesSent;
          }
        });

        let totalBytesReceived = 0;
        for (const recvTransport of recvTransportsRef.current) {
          try {
            const recvStats = await recvTransport.getStats();
            recvStats.forEach((report: any) => {
              if (report.type === 'inbound-rtp' && typeof report.bytesReceived === 'number') {
                totalBytesReceived += report.bytesReceived;
              }
            });
          } catch (_e) { /* transport may be closed */ }
        }

        const now = Date.now();
        if (prevBytesRef.current) {
          const dt = now - prevBytesRef.current.ts;
          const sendKbps = Math.max(0, Math.round((totalBytesSent - prevBytesRef.current.sent) * 8 / dt));
          const recvKbps = Math.max(0, Math.round((totalBytesReceived - prevBytesRef.current.received) * 8 / dt));
          setHardwareStats((prev: any) => ({
            ...(prev ?? {}),
            sendBitrate: sendKbps,
            recvBitrate: recvKbps,
          }));
        }
        prevBytesRef.current = { sent: totalBytesSent, received: totalBytesReceived, ts: now };
      } catch (e) {
        console.error('bandwidth stats error', e);
      }
    }, 3000);
    return () => {
      clearInterval(bwInterval);
      prevBytesRef.current = null;
      setHardwareStats((prev: any) => prev ? { ...prev, sendBitrate: null, recvBitrate: null } : null);
    };
  }, [state]);

  const debugInfo = {
    roomName: joinRoomId.trim(),
    localPeer: participants.find(p => p.isSelf) ? {
      name: participants.find(p => p.isSelf)!.userName,
      id: participants.find(p => p.isSelf)!.id,
      routerId: participants.find(p => p.isSelf)!.routerId,
      workerPid: participants.find(p => p.isSelf)!.workerPid,
    } : null,
    remotePeers: participants.filter(p => !p.isSelf).map(p => ({
      name: p.userName,
      id: p.id,
      routerId: p.routerId,
      workerPid: p.workerPid,
      hasStream: !!p.stream,
    })),
    telemetry: hardwareStats ? {
      uplink: hardwareStats.sendBitrate != null ? `${hardwareStats.sendBitrate} kbps` : null,
      downlink: hardwareStats.recvBitrate != null ? `${hardwareStats.recvBitrate} kbps` : null,
      systemCPU: hardwareStats.systemStats?.cpuLoad?.toFixed(2) + ' (1m load)',
      systemMemory: hardwareStats.systemStats?.memTotal
        ? (100 - (hardwareStats.systemStats.memFree / hardwareStats.systemStats.memTotal) * 100).toFixed(1) + '%'
        : null,
      workers: (hardwareStats.workerStats ?? []).map((w: any) => ({
        pid: w.pid,
        cpu: w.cpu.toFixed(1) + '%',
        mem: (w.memory / 1024 / 1024).toFixed(1) + 'MB',
      })),
    } : null
  };

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
          <p className="text-sm font-medium text-neutral-700 dark:text-white">Room: <code className="font-mono text-xs bg-black/5 dark:bg-black/50 px-2 py-1 rounded text-indigo-600 dark:text-purple-300 ml-1">{joinRoomId.trim() || routerId?.slice(0, 8)}</code></p>
        </div>
      )}

      <div className="absolute top-6 right-6 z-50 flex flex-col gap-3 items-end">
        {routerId && state === 'active' && (
          <div className={`bg-black/80 backdrop-blur-md border border-white/20 p-4 rounded-xl shadow-2xl text-[10px] md:text-xs font-mono text-green-400 max-h-[80vh] transition-all duration-300 ${showDiagnostics ? 'w-72 md:w-96 overflow-auto' : 'w-auto overflow-hidden'}`}>
            <div className={`flex justify-between items-center ${showDiagnostics ? 'border-b border-white/10 pb-2 mb-4' : 'gap-4'}`}>
              <span className="text-white font-bold tracking-wider whitespace-nowrap">TOPOLOGY DIAGNOSTICS</span>
              <div className="flex gap-2">
                {showDiagnostics && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))}
                    className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white transition-colors cursor-pointer"
                  >
                    Copy
                  </button>
                )}
                <button 
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  {showDiagnostics ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            {showDiagnostics && (
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </div>
        )}
        <ResourceMonitorCard
          hardwareStats={hardwareStats}
          myWorkerPid={participants.find(p => p.isSelf)?.workerPid}
          inMeeting={state === 'active'}
        />
        {import.meta.env.DEV && state === 'active' && (
          <BotPanel
            roomId={joinRoomId.trim()}
            botsRef={botsRef}
            botCounterRef={botCounterRef}
            fileInputRef={botVideoFileInputRef}
            botCount={botCount}
            onCountChange={setBotCount}
          />
        )}
      </div>

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
                placeholder="Enter your name (optional)"
                value={userNameInput}
                onChange={e => setUserNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && joinRoomId.trim() && handleJoinMeeting()}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-white transition-all shadow-sm"
                disabled={state === 'starting'}
              />
              <input
                type="text"
                placeholder="Enter custom room name (e.g. Weekly Sync)"
                value={joinRoomId}
                onChange={e => setJoinRoomId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && joinRoomId.trim() && handleJoinMeeting()}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-neutral-900 dark:text-white transition-all shadow-sm"
                disabled={state === 'starting'}
              />
              <Button 
                onClick={handleJoinMeeting} 
                className="w-full py-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-lg hover:shadow-indigo-500/25 cursor-pointer"
                disabled={state === 'starting' || !joinRoomId.trim()}
              >
                {state === 'starting' ? 'Connecting...' : 'Join / Create Meeting'}
              </Button>
            </div>
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
                
                {/* Peer ID & Diagnostic Topology Badge */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-2 z-20">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-white border border-white/10 shadow-lg inline-flex w-max">
                    {p.isSelf ? `You (${p.userName})` : `${p.userName || 'Unknown'} (${p.id.slice(-4)})`}
                  </div>
                  {p.routerId && (
                    <div className="bg-indigo-600/80 backdrop-blur-md px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold text-white/90 border border-indigo-400/30 shadow-lg inline-flex w-max items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      R:{p.routerId.split('-')[0]} • W:{p.workerPid || '?'}
                    </div>
                  )}
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
                    <div className="w-px h-6 bg-white/20 my-auto mx-1"></div>
                    <Button 
                      onClick={() => {
                        botsRef.current.forEach(b => b.disconnect());
                        botsRef.current = [];
                        window.location.reload();
                      }}
                      variant="destructive"
                      className="rounded-full shadow-lg transition-all cursor-pointer flex items-center gap-2 px-4 shadow-red-500/20"
                    >
                      <PhoneOff className="h-4 w-4" />
                      <span className="font-medium text-xs">Leave</span>
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
