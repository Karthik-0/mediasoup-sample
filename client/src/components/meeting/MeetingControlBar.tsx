import { LayoutGrid, MonitorPlay, Mic, MicOff, PanelsTopLeft, PhoneOff, Smile, Users, Video, VideoOff, Waves } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { MeetingLayoutMode } from '@/lib/meeting-layout'
import { cn } from '@/lib/utils'

const layoutOptions: Array<{ mode: MeetingLayoutMode; label: string; icon: typeof PanelsTopLeft }> = [
  { mode: 'speaker', label: 'Speaker', icon: PanelsTopLeft },
  { mode: 'gallery', label: 'Gallery', icon: LayoutGrid },
  { mode: 'presentation', label: 'Present', icon: MonitorPlay },
  { mode: 'spotlight', label: 'Spotlight', icon: Waves },
]

export function MeetingControlBar({
  audioMuted,
  videoOff,
  layoutMode,
  participantCount,
  participantPanelOpen,
  hasRaisedHand,
  onToggleAudio,
  onToggleVideo,
  onLayoutChange,
  onToggleParticipants,
  onToggleRaiseHand,
  onLeave,
  onReact,
  showTopologyDiagnostics,
  showResourceMonitor,
  showDevBots,
  onToggleTopologyDiagnostics,
  onToggleResourceMonitor,
  onToggleDevBots,
}: {
  audioMuted: boolean
  videoOff: boolean
  layoutMode: MeetingLayoutMode
  participantCount: number
  participantPanelOpen: boolean
  hasRaisedHand: boolean
  onToggleAudio: () => void
  onToggleVideo: () => void
  onLayoutChange: (mode: MeetingLayoutMode) => void
  onToggleParticipants: () => void
  onToggleRaiseHand: () => void
  onLeave: () => void
  onReact: () => void
  showTopologyDiagnostics: boolean
  showResourceMonitor: boolean
  showDevBots: boolean
  onToggleTopologyDiagnostics: () => void
  onToggleResourceMonitor: () => void
  onToggleDevBots: () => void
}) {
  const hasAnyDebugWindow = showTopologyDiagnostics || showResourceMonitor || showDevBots

  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onToggleAudio} variant={audioMuted ? 'destructive' : 'secondary'} size="icon" className="rounded-full">
            {audioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={onToggleVideo} variant={videoOff ? 'destructive' : 'secondary'} size="icon" className="rounded-full">
            {videoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
          <Button onClick={onReact} variant="secondary" size="sm" className="rounded-full border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200">
            <Smile className="mr-2 h-4 w-4" />
            Reactions
          </Button>
          <Button onClick={onToggleRaiseHand} variant="secondary" size="sm" className={cn('rounded-full border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200', hasRaisedHand && 'border-amber-400/70 bg-amber-100 text-amber-700')}>
            <Waves className="mr-2 h-4 w-4" />
            {hasRaisedHand ? 'Lower Hand' : 'Raise Hand'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onToggleParticipants} variant="secondary" size="sm" className={cn('rounded-full border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200', participantPanelOpen && 'border-cyan-500/60 bg-cyan-100 text-cyan-700')}>
            <Users className="mr-2 h-4 w-4" />
            Participants ({participantCount})
          </Button>
          <details className="relative">
            <summary
              className={cn(
                'list-none cursor-pointer rounded-full border px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200',
                hasAnyDebugWindow ? 'border-indigo-400/60 bg-indigo-100 text-indigo-700' : 'border-slate-300 bg-slate-100',
              )}
            >
              Show Debug Windows
            </summary>
            <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-50 w-64 rounded-xl border border-slate-200 bg-white/96 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
              <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" checked={showTopologyDiagnostics} onChange={onToggleTopologyDiagnostics} />
                Topology diagnostics
              </label>
              <label className="mb-2 flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" checked={showResourceMonitor} onChange={onToggleResourceMonitor} />
                Resource monitor
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                <input type="checkbox" checked={showDevBots} onChange={onToggleDevBots} />
                Dev bots
              </label>
            </div>
          </details>
          <div className="flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 p-1">
            {layoutOptions.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onLayoutChange(mode)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-800',
                  layoutMode === mode && 'bg-white text-slate-900 shadow-sm',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          <Button onClick={onLeave} variant="destructive" size="sm" className="rounded-full">
            <PhoneOff className="mr-2 h-4 w-4" />
            Leave
          </Button>
        </div>
      </div>
    </div>
  )
}