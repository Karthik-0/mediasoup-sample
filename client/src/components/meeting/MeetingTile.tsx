import { MicOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { MeetingPresentationParticipant } from '@/lib/meeting-layout'

const qualityTone = {
  good: 'bg-emerald-400',
  fair: 'bg-amber-400',
  poor: 'bg-rose-400',
  unknown: 'bg-white/25',
} as const

export function MeetingTile({
  participant,
  variant,
  localVideoRef,
  onAttachRemoteVideo,
  onTogglePin,
  onToggleSpotlight,
}: {
  participant: MeetingPresentationParticipant
  variant: 'stage' | 'filmstrip' | 'gallery'
  localVideoRef?: React.RefObject<HTMLVideoElement | null>
  onAttachRemoteVideo?: (element: HTMLVideoElement | null) => void
  onTogglePin?: () => void
  onToggleSpotlight?: () => void
}) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/8 bg-[#11151d] shadow-[0_24px_60px_rgba(0,0,0,0.45)]',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-b before:from-transparent before:via-transparent before:to-black/60 before:content-[""]',
        participant.isSpeaking && 'ring-2 ring-[#3B82F6] shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_28px_rgba(59,130,246,0.35)]',
        variant === 'stage' ? 'aspect-video min-h-[280px]' : 'aspect-video',
      )}
      style={{ contain: 'strict' }}
    >
      {participant.isSelf ? (
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      ) : participant.stream ? (
        <video
          ref={onAttachRemoteVideo}
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0f131a] text-neutral-400">
          <div className="flex h-18 w-18 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl font-semibold text-white">
            {participant.displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Awaiting stream</span>
        </div>
      )}

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-white/90 backdrop-blur-md">
          <span className={cn('h-2 w-2 rounded-full', qualityTone[participant.networkQuality])} />
          {participant.isOnStage ? 'ON STAGE' : 'LIVE'}
        </div>
        {!participant.isSelf && (onTogglePin || onToggleSpotlight) ? (
          <div className="flex gap-2">
            {onTogglePin && (
              <button
                type="button"
                onClick={onTogglePin}
                className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md transition hover:bg-white/10"
              >
                {participant.isPinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            {onToggleSpotlight && (
              <button
                type="button"
                onClick={onToggleSpotlight}
                className="rounded-full border border-white/10 bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white/85 backdrop-blur-md transition hover:bg-white/10"
              >
                {participant.isSpotlighted ? 'Exit Spot' : 'Spotlight'}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <div className="rounded-2xl border border-white/10 bg-black/45 px-3 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <span>{participant.displayName}</span>
            {participant.hasRaisedHand ? <span className="text-amber-300">Raised</span> : null}
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/60">
            {participant.routerId ? <span>R:{participant.routerId.split('-')[0]}</span> : null}
            {participant.workerPid ? <span>W:{participant.workerPid}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs text-white/85 backdrop-blur-md">
          {participant.audioMuted ? <MicOff className="h-3.5 w-3.5 text-rose-400" /> : null}
          <span>{participant.videoOff ? 'Audio only' : 'Video'}</span>
        </div>
      </div>
    </article>
  )
}