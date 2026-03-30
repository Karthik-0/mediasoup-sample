import { MicOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { MeetingPresentationParticipant } from '@/lib/meeting-layout'

const qualityTone = {
  good: 'bg-emerald-400',
  fair: 'bg-amber-400',
  poor: 'bg-rose-400',
  unknown: 'bg-slate-300',
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
        'group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.14)]',
        'before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-b before:from-transparent before:via-transparent before:to-slate-900/10 before:content-[""]',
        participant.isSpeaking && 'ring-2 ring-[#3B82F6] shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_28px_rgba(59,130,246,0.35)]',
        variant === 'stage' ? 'h-full min-h-0' : 'aspect-video',
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-100 text-slate-500">
          <div className={cn(
            'flex items-center justify-center rounded-full border border-slate-300 bg-white font-semibold text-slate-700',
            variant === 'filmstrip' ? 'h-10 w-10 text-base' : 'h-18 w-18 text-2xl',
          )}>
            {participant.displayName.charAt(0).toUpperCase()}
          </div>
          {variant !== 'filmstrip' && (
            <span className="text-xs uppercase tracking-[0.24em] text-slate-500">Awaiting stream</span>
          )}
        </div>
      )}

      {variant === 'stage' && (
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/80 px-2.5 py-1 text-[10px] font-medium tracking-[0.18em] text-slate-700 backdrop-blur-md">
            <span className={cn('h-2 w-2 rounded-full', qualityTone[participant.networkQuality])} />
            {participant.isOnStage ? 'ON STAGE' : 'LIVE'}
          </div>
          {!participant.isSelf && (onTogglePin || onToggleSpotlight) ? (
            <div className="flex gap-2">
              {onTogglePin && (
                <button
                  type="button"
                  onClick={onTogglePin}
                  className="rounded-full border border-slate-300/70 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-slate-700 backdrop-blur-md transition hover:bg-slate-100"
                >
                  {participant.isPinned ? 'Unpin' : 'Pin'}
                </button>
              )}
              {onToggleSpotlight && (
                <button
                  type="button"
                  onClick={onToggleSpotlight}
                  className="rounded-full border border-slate-300/70 bg-white/80 px-2.5 py-1 text-[10px] font-medium text-slate-700 backdrop-blur-md transition hover:bg-slate-100"
                >
                  {participant.isSpotlighted ? 'Exit Spot' : 'Spotlight'}
                </button>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* Filmstrip: compact single-line name + mute pill */}
      {variant === 'filmstrip' ? (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1.5 px-2 pb-2">
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/30 bg-black/50 px-2 py-1 backdrop-blur-md">
            <span className="truncate text-[11px] font-medium text-white">{participant.displayName}</span>
            {participant.hasRaisedHand ? <span className="text-[10px] text-amber-300">✋</span> : null}
          </div>
          {participant.audioMuted ? (
            <div className="shrink-0 rounded-lg border border-white/30 bg-black/50 p-1 backdrop-blur-md">
              <MicOff className="h-3 w-3 text-rose-400" />
            </div>
          ) : null}
        </div>
      ) : variant === 'gallery' ? (
        /* Gallery: compact bottom overlay — name + mute only */
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1.5 px-2 pb-2">
          <div className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/25 bg-black/45 px-2 py-1 backdrop-blur-md">
            <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', qualityTone[participant.networkQuality])} />
            <span className="truncate text-[11px] font-medium text-white">{participant.displayName}</span>
            {participant.hasRaisedHand ? <span className="text-[10px] text-amber-300">✋</span> : null}
          </div>
          {participant.audioMuted ? (
            <div className="shrink-0 rounded-lg border border-white/25 bg-black/45 p-1 backdrop-blur-md">
              <MicOff className="h-3 w-3 text-rose-400" />
            </div>
          ) : null}
        </div>
      ) : (
        /* Stage: full info overlay */
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
          <div className="rounded-2xl border border-slate-300/70 bg-white/85 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <span>{participant.displayName}</span>
              {participant.hasRaisedHand ? <span className="text-amber-600">✋</span> : null}
            </div>
            <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">
              {participant.routerId ? <span>R:{participant.routerId.split('-')[0]}</span> : null}
              {participant.workerPid ? <span>W:{participant.workerPid}</span> : null}
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-300/70 bg-white/85 px-3 py-2 text-xs text-slate-700 backdrop-blur-md">
            {participant.audioMuted ? <MicOff className="h-3.5 w-3.5 text-rose-400" /> : null}
            <span>{participant.videoOff ? 'Audio only' : 'Video'}</span>
          </div>
        </div>
      )}
    </article>
  )
}