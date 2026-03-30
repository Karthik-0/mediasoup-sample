import type { MeetingLayoutModel, MeetingLayoutMode, MeetingPresentationParticipant } from '@/lib/meeting-layout'
import { MeetingTile } from './MeetingTile'
import { ParticipantPanel } from './ParticipantPanel'

function stageGridClass(count: number) {
  if (count <= 1) return 'grid-cols-1'
  if (count === 2) return 'grid-cols-1 xl:grid-cols-2'
  return 'grid-cols-1 md:grid-cols-2'
}

export function LargeMeetingLayout({
  model,
  layoutMode,
  meetingDetails,
  participantPanelOpen,
  onCloseParticipantPanel,
  onTogglePin,
  onToggleSpotlight,
  localVideoRef,
  onAttachRemoteVideo,
  onGalleryPageChange,
}: {
  model: MeetingLayoutModel
  layoutMode: MeetingLayoutMode
  meetingDetails: {
    roomLabel: string
    routerId: string
    workerPid: number | null
    participantCount: number
  }
  participantPanelOpen: boolean
  onCloseParticipantPanel: () => void
  onTogglePin: (participantId: string) => void
  onToggleSpotlight: (participantId: string) => void
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  onAttachRemoteVideo: (participant: MeetingPresentationParticipant, element: HTMLVideoElement | null) => void
  onGalleryPageChange: (page: number) => void
}) {
  const renderTile = (participant: MeetingPresentationParticipant, variant: 'stage' | 'filmstrip' | 'gallery') => (
    <MeetingTile
      key={`${variant}-${participant.id}`}
      participant={participant}
      variant={variant}
      localVideoRef={participant.isSelf ? localVideoRef : undefined}
      onAttachRemoteVideo={!participant.isSelf ? (element) => onAttachRemoteVideo(participant, element) : undefined}
      onTogglePin={!participant.isSelf ? () => onTogglePin(participant.id) : undefined}
      onToggleSpotlight={!participant.isSelf ? () => onToggleSpotlight(participant.id) : undefined}
    />
  )

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col gap-0 px-0 pb-20 pt-0">
        {layoutMode === 'gallery' ? (
          <section className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Gallery Mode</div>
                <h2 className="mt-2 text-2xl font-semibold text-slate-800">Visible page {model.currentGalleryPage + 1} of {model.totalGalleryPages}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onGalleryPageChange(Math.max(0, model.currentGalleryPage - 1))}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => onGalleryPageChange(Math.min(model.totalGalleryPages - 1, model.currentGalleryPage + 1))}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-700 transition hover:bg-slate-100"
                >
                  Next
                </button>
              </div>
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {model.galleryParticipants.map((participant) => renderTile(participant, 'gallery'))}
            </div>
          </section>
        ) : (
          <>
            <section className="relative flex min-h-0 flex-1 overflow-hidden bg-black">
              <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-700 backdrop-blur-md">
                <span>{layoutMode === 'spotlight' ? 'Spotlight' : layoutMode === 'presentation' ? 'Presentation' : 'Speaker Focus'}</span>
                <span className="text-slate-400">•</span>
                <span>{model.stageParticipants.length} on stage</span>
                <span className="text-slate-400">•</span>
                <span>+{model.overflowCount} others</span>
              </div>
              <details className="absolute right-4 top-4 z-20">
                <summary className="list-none cursor-pointer select-none rounded-full border border-slate-300/80 bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-700 backdrop-blur-md transition hover:bg-white">
                  Meeting details
                </summary>
                <div className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(86vw,22rem)] rounded-2xl border border-slate-200 bg-white/96 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.18)] backdrop-blur-md">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Meeting Info</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Room</div>
                      <div className="mt-1 truncate font-mono text-[11px] text-slate-800">{meetingDetails.roomLabel}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Layout</div>
                      <div className="mt-1 font-medium text-slate-800">{layoutMode}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Participants</div>
                      <div className="mt-1 font-medium text-slate-800">{meetingDetails.participantCount}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Worker PID</div>
                      <div className="mt-1 font-mono text-[11px] text-slate-800">{meetingDetails.workerPid ?? 'N/A'}</div>
                    </div>
                    <div className="col-span-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Router ID</div>
                      <div className="mt-1 truncate font-mono text-[11px] text-slate-800">{meetingDetails.routerId}</div>
                    </div>
                  </div>
                </div>
              </details>
              <div className={`grid h-full min-h-0 flex-1 auto-rows-fr gap-0 ${stageGridClass(model.stageParticipants.length)}`}>
                {model.stageParticipants.map((participant) => renderTile(participant, 'stage'))}
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/55 via-black/25 to-transparent px-4 pb-3 pt-12">
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/85">Filmstrip</div>
                  {model.overflowCount > 0 ? (
                    <div className="rounded-full border border-white/25 bg-black/35 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/85">
                      +{model.overflowCount} others
                    </div>
                  ) : null}
                </div>
                <div className="pointer-events-auto flex gap-2 overflow-x-auto overflow-y-hidden pb-1">
                  {model.filmstripParticipants.map((participant) => (
                    <div key={`filmstrip-wrap-${participant.id}`} className="w-[150px] shrink-0 md:w-[180px]">
                      {renderTile(participant, 'filmstrip')}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>

      <ParticipantPanel
        participants={model.rosterParticipants}
        isOpen={participantPanelOpen}
        onClose={onCloseParticipantPanel}
        onTogglePin={onTogglePin}
        onToggleSpotlight={onToggleSpotlight}
      />
    </div>
  )
}