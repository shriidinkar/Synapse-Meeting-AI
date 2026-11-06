import React, { useState } from 'react';
import { CheckSquare, ShieldCheck, Tag, User, Layers, Search } from 'lucide-react';
import { Decision } from '../types/meeting';

interface DecisionsViewProps {
  decisions: Decision[];
  onJumpToQuote: (quote: string) => void;
}

export const DecisionsView: React.FC<DecisionsViewProps> = ({ decisions, onJumpToQuote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImpact, setSelectedImpact] = useState('all');

  const impactAreas = Array.from(new Set(decisions.map((d) => d.impactArea))).filter(Boolean);

  const filteredDecisions = decisions.filter((d) => {
    if (selectedImpact !== 'all' && d.impactArea !== selectedImpact) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.rationale.toLowerCase().includes(q) ||
        d.decidedBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Decisions Log</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              {decisions.length} confirmed
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Locked-in commitments, technical choices, and executive sign-offs extracted from the meeting.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search decisions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {impactAreas.length > 0 && (
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All Impact Areas</option>
              {impactAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Decisions List */}
      <div className="divide-y divide-slate-700/60">
        {filteredDecisions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No decisions match your search criteria.
          </div>
        ) : (
          filteredDecisions.map((decision, index) => (
            <div key={decision.id || index} className="p-4 sm:p-5 hover:bg-slate-750/30 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-white text-sm">{decision.title}</h3>
                </div>

                <div className="flex items-center space-x-2 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-indigo-300 font-medium flex items-center space-x-1">
                    <Layers className="w-3 h-3 text-indigo-400" />
                    <span>{decision.impactArea}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center space-x-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{decision.decidedBy}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mb-2.5 leading-relaxed pl-8">
                {decision.description}
              </p>

              {/* Rationale Callout */}
              {decision.rationale && (
                <div className="ml-8 mb-3 text-xs bg-slate-900/60 rounded-lg p-2.5 border border-slate-800 text-slate-300">
                  <span className="font-semibold text-slate-200">Rationale: </span>
                  <span className="text-slate-400">{decision.rationale}</span>
                </div>
              )}

              {/* Verbatim Grounded Quote Link */}
              {decision.citation?.quote && (
                <div className="ml-8">
                  <button
                    type="button"
                    onClick={() => onJumpToQuote(decision.citation.quote)}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-800 text-indigo-300 hover:text-indigo-200 transition text-[11px] group"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Grounded Quote: <em className="text-slate-300">"{decision.citation.quote.slice(0, 50)}..."</em>
                    </span>
                    <span className="text-slate-500 group-hover:text-slate-400">
                      ({decision.citation.speaker || 'Speaker'})
                    </span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
