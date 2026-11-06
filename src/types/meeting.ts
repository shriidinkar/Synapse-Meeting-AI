export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export type AmbiguityType =
  | 'missing_owner'
  | 'vague_deadline'
  | 'underspecified_scope'
  | 'conflicting_statements'
  | 'missing_dependency';

export type ClarificationStatus = 'needs_clarification' | 'resolved' | 'clear';

export interface GroundingCitation {
  quote: string;
  speaker: string;
  timestamp?: string; // e.g. "12:45"
  confidence: number; // 0.0 - 1.0
}

export interface AmbiguityInfo {
  isAmbiguous: boolean;
  type?: AmbiguityType;
  explanation?: string;
  clarificationQuestion?: string;
  suggestedResolutions?: string[];
  resolvedValue?: string;
  resolvedAt?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  assignee: {
    name: string;
    role?: string;
    isAmbiguous: boolean;
  };
  deadline: {
    raw: string; // e.g. "by next Friday" or "Nov 14"
    isoDate?: string; // e.g. "2026-11-14T17:00:00"
    isAmbiguous: boolean;
  };
  priority: Priority;
  category: string; // e.g. "Engineering", "Design", "Product", "Operations", "Follow-up"
  status: 'pending' | 'in_progress' | 'completed';
  ambiguity: AmbiguityInfo;
  citation: GroundingCitation;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  decidedBy: string; // e.g. "Team Consensus", "Sarah (Tech Lead)", "Alex"
  rationale: string;
  impactArea: string; // e.g. "Architecture", "Budget", "Release Schedule"
  citation: GroundingCitation;
}

export interface KeyTopic {
  topic: string;
  summary: string;
  speakers: string[];
  keyQuotes: GroundingCitation[];
}

export interface FollowUpRecommendation {
  id: string;
  type: 'next_meeting' | 'external_communication' | 'open_question' | 'approval_needed';
  title: string;
  description: string;
  suggestedTimeline?: string;
  suggestedParticipants?: string[];
  citation?: GroundingCitation;
}

export interface ParticipantStat {
  name: string;
  speakerLabel?: string;
  actionsAssignedCount: number;
  decisionsInvolvedCount: number;
}

export interface MeetingAnalysis {
  id: string;
  title: string;
  meetingDate: string; // YYYY-MM-DD
  durationEstimated?: string;
  executiveSummary: string;
  sentiment: 'constructive' | 'aligned' | 'debated' | 'urgent';
  participants: ParticipantStat[];
  decisions: Decision[];
  actionItems: ActionItem[];
  keyTopics: KeyTopic[];
  followUps: FollowUpRecommendation[];
  rawTranscript: string;
  createdAt: string;
}

export interface TranscriptLine {
  id: string;
  speaker: string;
  timestamp: string;
  text: string;
  raw: string;
}
