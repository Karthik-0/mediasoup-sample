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
      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-28 pt-24 md:px-6 xl:px-8">
        {layoutMode === 'gallery' ? (
          <section className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/8 bg-white/[0.02] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-white/45">Gallery Mode</div>
                <h2 className="mt-2 text-2xl font-semibold text-white">Visible page {model.currentGalleryPage + 1} of {model.totalGalleryPages}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onGalleryPageChange(Math.max(0, model.currentGalleryPage - 1))}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/10"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => onGalleryPageChange(Math.min(model.totalGalleryPages - 1, model.currentGalleryPage + 1))}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/10"
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
            <section className="flex min-h-[50vh] flex-1 flex-col rounded-[32px] border border-white/8 bg-linear-to-br from-white/[0.05] to-white/[0.015] p-4 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/45">Stage</div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{layoutMode === 'spotlight' ? 'Spotlight' : layoutMode === 'presentation' ? 'Presentation' : 'Speaker Focus'}</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white/70">
                  {model.stageParticipants.length} visible • +{model.overflowCount} others
                </div>
              </div>
              <div className={`grid min-h-0 flex-1 gap-4 ${stageGridClass(model.stageParticipants.length)}`}>
                {model.stageParticipants.map((participant) => renderTile(participant, 'stage'))}
              </div>
            </section>

            <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-white/45">Filmstrip</div>
                  <p className="mt-1 text-sm text-white/65">Recently active and pinned participants stay close without flooding the stage.</p>
                </div>
                {model.overflowCount > 0 ? (
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/70">
                    +{model.overflowCount} others
                  </div>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
                {model.filmstripParticipants.map((participant) => renderTile(participant, 'filmstrip'))}
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