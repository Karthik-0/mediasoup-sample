import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { cn } from '@/lib/utils'
import type { MeetingPresentationParticipant } from '@/lib/meeting-layout'

function ParticipantRow({
  participant,
  onTogglePin,
  onToggleSpotlight,
}: {
  participant: MeetingPresentationParticipant
  onTogglePin: () => void
  onToggleSpotlight: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-white">
          {participant.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white">{participant.displayName}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-white/55">
            {participant.hasRaisedHand ? <span className="text-amber-300">Raised</span> : null}
            {participant.isOnStage ? <span className="text-cyan-300">On Stage</span> : null}
            {participant.audioMuted ? <span className="text-rose-300">Muted</span> : <span>Audio</span>}
            {participant.videoOff ? <span>Audio only</span> : <span>Video</span>}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={onTogglePin}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] transition',
            participant.isPinned ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200' : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
          )}
        >
          {participant.isPinned ? 'Pinned' : 'Pin'}
        </button>
        <button
          type="button"
          onClick={onToggleSpotlight}
          className={cn(
            'rounded-full border px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] transition',
            participant.isSpotlighted ? 'border-indigo-400/50 bg-indigo-500/15 text-indigo-100' : 'border-white/10 bg-white/5 text-white/75 hover:bg-white/10',
          )}
        >
          {participant.isSpotlighted ? 'Live' : 'Spot'}
        </button>
      </div>
    </div>
  )
}

export function ParticipantPanel({
  participants,
  isOpen,
  onClose,
  onTogglePin,
  onToggleSpotlight,
}: {
  participants: MeetingPresentationParticipant[]
  isOpen: boolean
  onClose: () => void
  onTogglePin: (participantId: string) => void
  onToggleSpotlight: (participantId: string) => void
}) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: participants.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 76,
    overscan: 6,
  })

  return (
    <aside
      className={cn(
        'absolute inset-y-0 right-0 z-40 w-full max-w-sm border-l border-white/10 bg-[#0c1118]/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 md:max-w-md',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      )}
      aria-hidden={!isOpen}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold tracking-[0.16em] text-white uppercase">Participants</h3>
          <p className="mt-1 text-xs text-white/55">Virtualized roster sorted for stage management.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/75 transition hover:bg-white/10"
        >
          Close
        </button>
      </div>

      <div ref={parentRef} className="h-[calc(100%-73px)] overflow-auto px-4 py-4">
        <div
          className="relative w-full"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const participant = participants[virtualRow.index]

            return (
              <div
                key={participant.id}
                className="absolute left-0 top-0 w-full pb-3"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <ParticipantRow
                  participant={participant}
                  onTogglePin={() => onTogglePin(participant.id)}
                  onToggleSpotlight={() => onToggleSpotlight(participant.id)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}