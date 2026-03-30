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
}) {
  return (
    <div className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[#0b1016]/88 px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onToggleAudio} variant={audioMuted ? 'destructive' : 'secondary'} size="icon" className="rounded-full">
            {audioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={onToggleVideo} variant={videoOff ? 'destructive' : 'secondary'} size="icon" className="rounded-full">
            {videoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
          <Button onClick={onReact} variant="secondary" size="sm" className="rounded-full bg-white/8 text-white hover:bg-white/15">
            <Smile className="mr-2 h-4 w-4" />
            Reactions
          </Button>
          <Button onClick={onToggleRaiseHand} variant="secondary" size="sm" className={cn('rounded-full bg-white/8 text-white hover:bg-white/15', hasRaisedHand && 'border-amber-300/40 bg-amber-500/15 text-amber-100')}>
            <Waves className="mr-2 h-4 w-4" />
            {hasRaisedHand ? 'Lower Hand' : 'Raise Hand'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={onToggleParticipants} variant="secondary" size="sm" className={cn('rounded-full bg-white/8 text-white hover:bg-white/15', participantPanelOpen && 'border-cyan-300/40 bg-cyan-500/15 text-cyan-100')}>
            <Users className="mr-2 h-4 w-4" />
            Participants ({participantCount})
          </Button>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {layoutOptions.map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => onLayoutChange(mode)}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium text-white/65 transition hover:bg-white/10 hover:text-white',
                  layoutMode === mode && 'bg-white text-[#0d0f14]',
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