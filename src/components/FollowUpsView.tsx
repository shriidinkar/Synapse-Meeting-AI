import React from 'react';
import { Calendar, Users, HelpCircle, Mail, ArrowRight, ExternalLink } from 'lucide-react';
import { FollowUpRecommendation } from '../types/meeting';

interface FollowUpsViewProps {
  followUps: FollowUpRecommendation[];
  meetingTitle: string;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({ followUps, meetingTitle }) => {
  const getFollowUpIcon = (type: string) => {
    switch (type) {
      case 'next_meeting':
        return <Calendar className="w-4 h-4 text-indigo-400" />;
      case 'external_communication':
        return <Mail className="w-4 h-4 text-sky-400" />;
      case 'open_question':
        return <HelpCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <ArrowRight className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getCalendarUrlForFollowUp = (item: FollowUpRecommendation) => {
    const title = `[Sync] ${item.title}`;
    const details = `${item.description}\n\nSuggested Attendees: ${item.suggestedParticipants?.join(', ') || 'Team'}\nFrom Meeting: ${meetingTitle}`;
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: details,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm">
      <div className="p-4 sm:p-6 border-b border-slate-700/80">
        <h2 className="text-lg font-bold text-white tracking-tight">Follow-Ups & Open Items</h2>
        <p className="text-xs text-slate-400 mt-1">
          Recommended subsequent checkpoints, external stakeholder updates, and unanswered questions.
        </p>
      </div>

      <div className="divide-y divide-slate-700/60">
        {followUps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No pending follow-ups or unanswered questions identified.
          </div>
        ) : (
          followUps.map((item, idx) => (
            <div key={item.id || idx} className="p-4 sm:p-5 hover:bg-slate-750/30 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">
                    {getFollowUpIcon(item.type)}
                  </div>
                  <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-medium">
                    {item.type.replace('_', ' ').toUpperCase()}
                  </span>
                  {item.suggestedTimeline && (
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                      {item.suggestedTimeline}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-3 leading-relaxed pl-9">
                {item.description}
              </p>

              <div className="pl-9 flex flex-wrap items-center justify-between gap-3 pt-1">
                {item.suggestedParticipants && item.suggestedParticipants.length > 0 && (
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>Recommended Attendees:</span>
                    <span className="text-slate-200 font-medium">
                      {item.suggestedParticipants.join(', ')}
                    </span>
                  </div>
                )}

                {item.type === 'next_meeting' && (
                  <a
                    href={getCalendarUrlForFollowUp(item)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center space-x-1.5 transition ml-auto"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Schedule in Google Calendar</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
