import React from 'react';
import { FileText, Users, Activity, CheckCircle, ShieldCheck, MessageCircle, BarChart3, Clock } from 'lucide-react';
import { MeetingAnalysis } from '../types/meeting';

interface SummaryViewProps {
  analysis: MeetingAnalysis;
  onJumpToQuote: (quote: string) => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ analysis, onJumpToQuote }) => {
  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'constructive':
        return { label: 'Constructive & Solution-Focused', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
      case 'aligned':
        return { label: 'Strongly Aligned', color: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' };
      case 'debated':
        return { label: 'Active Debate & Exploration', color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
      case 'urgent':
        return { label: 'Urgent & Critical', color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
      default:
        return { label: sentiment, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const sentimentInfo = getSentimentBadge(analysis.sentiment);

  return (
    <div className="space-y-6">
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sentiment Card */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Meeting Dynamic</span>
          </div>
          <div className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${sentimentInfo.color}`}>
            {sentimentInfo.label}
          </div>
        </div>

        {/* Tasks Extracted */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Action Items</span>
          </div>
          <div className="text-xl font-bold text-white">
            {analysis.actionItems.length}{' '}
            <span className="text-xs font-normal text-slate-400">
              ({analysis.actionItems.filter((i) => i.status === 'completed').length} completed)
            </span>
          </div>
        </div>

        {/* Decisions Locked */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Decisions Locked</span>
          </div>
          <div className="text-xl font-bold text-white">
            {analysis.decisions.length}{' '}
            <span className="text-xs font-normal text-slate-400">commitments</span>
          </div>
        </div>

        {/* Participants Identified */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 shadow-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1.5">
            <Users className="w-4 h-4 text-violet-400" />
            <span>Participants</span>
          </div>
          <div className="text-xl font-bold text-white">
            {analysis.participants.length}{' '}
            <span className="text-xs font-normal text-slate-400">speakers active</span>
          </div>
        </div>
      </div>

      {/* Executive Summary Card */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center space-x-2.5 mb-3.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Executive Summary</h2>
            <div className="text-xs text-slate-400">Autonomous synthesis synthesized directly from dialogue</div>
          </div>
        </div>

        <div className="text-slate-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-slate-900/50 p-4 sm:p-5 rounded-xl border border-slate-800">
          {analysis.executiveSummary}
        </div>
      </div>

      {/* Key Topics Breakdown */}
      {analysis.keyTopics && analysis.keyTopics.length > 0 && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-indigo-400" />
            <span>Key Discussion Topics</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {analysis.keyTopics.map((topic, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-750 hover:border-slate-700 transition"
              >
                <div className="font-semibold text-white text-xs mb-1 text-indigo-300">
                  {topic.topic}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-2">
                  {topic.summary}
                </p>
                {topic.speakers && topic.speakers.length > 0 && (
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500">Speakers:</span>
                    <span>{topic.speakers.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participant Accountability Grid */}
      {analysis.participants && analysis.participants.length > 0 && (
        <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl p-5 sm:p-6 backdrop-blur-sm">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Participant Accountability & Participation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analysis.participants.map((p, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-750 flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {p.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">{p.name}</div>
                    {p.speakerLabel && (
                      <div className="text-[10px] text-slate-400">{p.speakerLabel}</div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-indigo-300">
                    {p.actionsAssignedCount} <span className="text-[10px] font-normal text-slate-400">tasks</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {p.decisionsInvolvedCount} decisions
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
