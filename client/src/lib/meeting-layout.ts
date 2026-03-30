export type MeetingLayoutMode = 'speaker' | 'gallery' | 'presentation' | 'spotlight'

export type NetworkQuality = 'good' | 'fair' | 'poor' | 'unknown'

export interface MeetingParticipant {
  id: string
  isSelf: boolean
  stream?: MediaStream
  routerId?: string
  workerPid?: number
  userName?: string
}

export interface MeetingPresentationParticipant extends MeetingParticipant {
  displayName: string
  audioMuted: boolean
  videoOff: boolean
  isPinned: boolean
  isSpotlighted: boolean
  hasRaisedHand: boolean
  isSpeaking: boolean
  isOnStage: boolean
  networkQuality: NetworkQuality
}

export interface MeetingLayoutModel {
  rosterParticipants: MeetingPresentationParticipant[]
  stageParticipants: MeetingPresentationParticipant[]
  filmstripParticipants: MeetingPresentationParticipant[]
  galleryParticipants: MeetingPresentationParticipant[]
  overflowCount: number
  totalGalleryPages: number
  currentGalleryPage: number
  maxVisibleTiles: number
}

export const MAX_MEETING_VIDEO_TILES = 16
export const GALLERY_PAGE_SIZE = 16
const FILMSTRIP_SIZE = 7

function hasEnabledTrack(participant: MeetingParticipant, kind: 'audio' | 'video') {
  return participant.stream?.getTracks().some((track) => track.kind === kind && track.enabled) ?? false
}

function participantName(participant: MeetingParticipant) {
  return participant.userName?.trim() || (participant.isSelf ? 'You' : `Guest ${participant.id.slice(-4)}`)
}

function networkQualityForParticipant(participant: MeetingParticipant): NetworkQuality {
  if (!participant.stream) return 'unknown'
  if (participant.stream.getVideoTracks().length > 0) return 'good'
  if (participant.stream.getAudioTracks().length > 0) return 'fair'
  return 'poor'
}

function decorateParticipants(
  participants: MeetingParticipant[],
  {
    localAudioMuted,
    localVideoOff,
    pinnedParticipantIds,
    spotlightParticipantId,
    raisedHandParticipantIds,
  }: {
    localAudioMuted: boolean
    localVideoOff: boolean
    pinnedParticipantIds: string[]
    spotlightParticipantId: string | null
    raisedHandParticipantIds: string[]
  },
) {
  const pinnedIds = new Set(pinnedParticipantIds)
  const raisedIds = new Set(raisedHandParticipantIds)

  return participants.map<MeetingPresentationParticipant>((participant, index) => {
    const audioMuted = participant.isSelf ? localAudioMuted : !hasEnabledTrack(participant, 'audio')
    const videoOff = participant.isSelf ? localVideoOff : !hasEnabledTrack(participant, 'video')
    const displayName = participantName(participant)
    const isPinned = pinnedIds.has(participant.id)
    const isSpotlighted = spotlightParticipantId === participant.id
    const hasRaisedHand = raisedIds.has(participant.id)
    const isSpeaking = isSpotlighted || isPinned || (index === 0 && !participant.isSelf)

    return {
      ...participant,
      displayName,
      audioMuted,
      videoOff,
      isPinned,
      isSpotlighted,
      hasRaisedHand,
      isSpeaking,
      isOnStage: false,
      networkQuality: networkQualityForParticipant(participant),
    }
  })
}

function participantScore(participant: MeetingPresentationParticipant) {
  return [
    participant.hasRaisedHand ? 1 : 0,
    participant.isSpotlighted ? 1 : 0,
    participant.isPinned ? 1 : 0,
    participant.isSpeaking ? 1 : 0,
    participant.videoOff ? 0 : 1,
    participant.audioMuted ? 0 : 1,
    participant.isSelf ? 1 : 0,
  ]
}

function compareParticipants(a: MeetingPresentationParticipant, b: MeetingPresentationParticipant) {
  const aScore = participantScore(a)
  const bScore = participantScore(b)

  for (let index = 0; index < aScore.length; index += 1) {
    if (aScore[index] !== bScore[index]) {
      return bScore[index] - aScore[index]
    }
  }

  return a.displayName.localeCompare(b.displayName)
}

export function buildMeetingLayoutModel({
  participants,
  layoutMode,
  galleryPage,
  maxVisibleTiles = MAX_MEETING_VIDEO_TILES,
  localAudioMuted,
  localVideoOff,
  pinnedParticipantIds,
  spotlightParticipantId,
  raisedHandParticipantIds,
}: {
  participants: MeetingParticipant[]
  layoutMode: MeetingLayoutMode
  galleryPage: number
  maxVisibleTiles?: number
  localAudioMuted: boolean
  localVideoOff: boolean
  pinnedParticipantIds: string[]
  spotlightParticipantId: string | null
  raisedHandParticipantIds: string[]
}): MeetingLayoutModel {
  const sorted = decorateParticipants(participants, {
    localAudioMuted,
    localVideoOff,
    pinnedParticipantIds,
    spotlightParticipantId,
    raisedHandParticipantIds,
  }).sort(compareParticipants)

  const stageCandidates = sorted.filter((participant) => participant.isSpotlighted || participant.isPinned || participant.isSpeaking)
  const defaultStage = stageCandidates[0] ?? sorted[0]

  let stageParticipants: MeetingPresentationParticipant[] = []
  let filmstripParticipants: MeetingPresentationParticipant[] = []
  let galleryParticipants: MeetingPresentationParticipant[] = []

  if (layoutMode === 'gallery') {
    const totalGalleryPages = Math.max(1, Math.ceil(sorted.length / GALLERY_PAGE_SIZE))
    const safePage = Math.min(galleryPage, totalGalleryPages - 1)
    galleryParticipants = sorted.slice(safePage * GALLERY_PAGE_SIZE, (safePage + 1) * GALLERY_PAGE_SIZE)

    return {
      rosterParticipants: sorted,
      stageParticipants,
      filmstripParticipants,
      galleryParticipants: galleryParticipants.map((participant) => ({ ...participant, isOnStage: true })),
      overflowCount: Math.max(0, sorted.length - galleryParticipants.length),
      totalGalleryPages,
      currentGalleryPage: safePage,
      maxVisibleTiles,
    }
  }

  if (defaultStage) {
    stageParticipants = [defaultStage]
  }

  if (layoutMode === 'presentation' && sorted.length > 1) {
    stageParticipants = sorted.slice(0, 1)
  }

  if (layoutMode === 'spotlight' && spotlightParticipantId) {
    const spotlighted = sorted.find((participant) => participant.id === spotlightParticipantId)
    if (spotlighted) {
      stageParticipants = [spotlighted]
    }
  }

  const stageIds = new Set(stageParticipants.map((participant) => participant.id))
  const remainingParticipants = sorted.filter((participant) => !stageIds.has(participant.id))
  filmstripParticipants = remainingParticipants.slice(0, Math.max(0, Math.min(FILMSTRIP_SIZE, maxVisibleTiles - stageParticipants.length)))

  // Keep local self visible in stage/filmstrip layouts to prevent user disorientation.
  const selfParticipant = sorted.find((participant) => participant.isSelf)
  if (selfParticipant && !stageIds.has(selfParticipant.id) && !filmstripParticipants.some((participant) => participant.id === selfParticipant.id)) {
    const filmstripCapacity = Math.max(0, Math.min(FILMSTRIP_SIZE, maxVisibleTiles - stageParticipants.length))
    if (filmstripCapacity > 0) {
      if (filmstripParticipants.length >= filmstripCapacity) {
        filmstripParticipants = [...filmstripParticipants.slice(0, filmstripCapacity - 1), selfParticipant]
      } else {
        filmstripParticipants = [...filmstripParticipants, selfParticipant]
      }
    }
  }

  const visibleIds = new Set([...stageParticipants, ...filmstripParticipants].map((participant) => participant.id))

  return {
    rosterParticipants: sorted.map((participant) => ({ ...participant, isOnStage: visibleIds.has(participant.id) })),
    stageParticipants: stageParticipants.map((participant) => ({ ...participant, isOnStage: true })),
    filmstripParticipants: filmstripParticipants.map((participant) => ({ ...participant, isOnStage: true })),
    galleryParticipants,
    overflowCount: Math.max(0, sorted.length - visibleIds.size),
    totalGalleryPages: Math.max(1, Math.ceil(sorted.length / GALLERY_PAGE_SIZE)),
    currentGalleryPage: 0,
    maxVisibleTiles,
  }
}