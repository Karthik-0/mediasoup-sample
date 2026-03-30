import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

import { cn } from '@/lib/utils'
import type { MeetingPresentationParticipant } from '@/lib/meeting-layout'

// Stable palettes — full Tailwind class strings so they are not purged
const ROUTER_PALETTES = [
  { row: 'bg-sky-50 border-sky-100',      routerBadge: 'bg-sky-100 text-sky-700' },
  { row: 'bg-violet-50 border-violet-100', routerBadge: 'bg-violet-100 text-violet-700' },
  { row: 'bg-emerald-50 border-emerald-100', routerBadge: 'bg-emerald-100 text-emerald-700' },
  { row: 'bg-amber-50 border-amber-100',  routerBadge: 'bg-amber-100 text-amber-700' },
  { row: 'bg-rose-50 border-rose-100',    routerBadge: 'bg-rose-100 text-rose-700' },
  { row: 'bg-teal-50 border-teal-100',    routerBadge: 'bg-teal-100 text-teal-700' },
  { row: 'bg-orange-50 border-orange-100', routerBadge: 'bg-orange-100 text-orange-700' },
  { row: 'bg-pink-50 border-pink-100',    routerBadge: 'bg-pink-100 text-pink-700' },
]

const WORKER_BADGE_COLORS = [
  'bg-slate-200 text-slate-700',
  'bg-indigo-100 text-indigo-700',
  'bg-lime-100 text-lime-700',
  'bg-cyan-100 text-cyan-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-yellow-100 text-yellow-700',
]

function simpleHash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = ((h * 31) + s.charCodeAt(i)) & 0xffff
  return h
}

function routerPalette(routerId?: string) {
  if (!routerId) return ROUTER_PALETTES[0]
  return ROUTER_PALETTES[simpleHash(routerId) % ROUTER_PALETTES.length]
}

function workerBadgeColor(workerPid?: number) {
  if (workerPid == null) return WORKER_BADGE_COLORS[0]
  return WORKER_BADGE_COLORS[workerPid % WORKER_BADGE_COLORS.length]
}

function ParticipantRow({
  participant,
  onTogglePin,
  onToggleSpotlight,
}: {
  participant: MeetingPresentationParticipant
  onTogglePin: () => void
  onToggleSpotlight: () => void
}) {
  const palette = routerPalette(participant.routerId)
  const workerColor = workerBadgeColor(participant.workerPid)
  const routerShort = participant.routerId ? participant.routerId.slice(0, 6) : null

  return (
    <div className={cn('flex items-center gap-2 rounded-xl border px-2.5 py-2', palette.row)}>
      {/* Avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-semibold text-slate-600 shadow-sm">
        {participant.displayName.charAt(0).toUpperCase()}
      </div>

      {/* Name + badges */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-xs font-medium text-slate-800">{participant.displayName}</span>
          {participant.hasRaisedHand && <span className="text-[10px]">✋</span>}
          {participant.audioMuted && (
            <span className="text-[9px] font-semibold text-rose-500">M</span>
          )}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {routerShort && (
            <span className={cn('rounded px-1 py-0 text-[9px] font-mono font-medium leading-4', palette.routerBadge)}>
              R:{routerShort}
            </span>
          )}
          {participant.workerPid != null && (
            <span className={cn('rounded px-1 py-0 text-[9px] font-mono font-medium leading-4', workerColor)}>
              W:{participant.workerPid}
            </span>
          )}
        </div>
      </div>

      {/* Pin / Spotlight */}
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onClick={onTogglePin}
          title={participant.isPinned ? 'Unpin' : 'Pin'}
          className={cn(
            'rounded-full border px-2 py-0.5 text-[9px] font-medium transition',
            participant.isPinned
              ? 'border-cyan-400/60 bg-cyan-100 text-cyan-700'
              : 'border-slate-300/60 bg-white/60 text-slate-500 hover:bg-white',
          )}
        >
          {participant.isPinned ? '📌' : 'Pin'}
        </button>
        <button
          type="button"
          onClick={onToggleSpotlight}
          title={participant.isSpotlighted ? 'Unspotlight' : 'Spotlight'}
          className={cn(
            'rounded-full border px-2 py-0.5 text-[9px] font-medium transition',
            participant.isSpotlighted
              ? 'border-indigo-400/60 bg-indigo-100 text-indigo-700'
              : 'border-slate-300/60 bg-white/60 text-slate-500 hover:bg-white',
          )}
        >
          {participant.isSpotlighted ? '⭐' : 'Spot'}
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
    estimateSize: () => 58,
    overscan: 6,
  })

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white/95 shadow-xl backdrop-blur-xl transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
      aria-hidden={!isOpen}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
        <span className="text-xs font-semibold text-slate-700">
          Participants <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{participants.length}</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Legend */}
      <div className="border-b border-slate-100 px-3 py-1.5 text-[9px] text-slate-400">
        Color = router group &nbsp;·&nbsp; W badge = worker PID
      </div>

      {/* List */}
      <div ref={parentRef} className="flex-1 overflow-auto px-2 py-2">
        <div className="relative w-full" style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const participant = participants[virtualRow.index]
            return (
              <div
                key={participant.id}
                className="absolute left-0 top-0 w-full pb-1.5"
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