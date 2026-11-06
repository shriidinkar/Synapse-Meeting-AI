import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquare, Send, Sparkles, User, Calendar, HelpCircle, ArrowRight, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { ActionItem } from '../types/meeting';

interface AmbiguityResolverProps {
  actionItems: ActionItem[];
  onResolveItem: (itemId: string, userResolution: string) => Promise<void>;
  onManualUpdate: (itemId: string, updates: Partial<ActionItem>) => void;
  onJumpToQuote: (quote: string) => void;
  meetingTitle: string;
}

export const AmbiguityResolver: React.FC<AmbiguityResolverProps> = ({
  actionItems,
  onResolveItem,
  onManualUpdate,
  onJumpToQuote,
  meetingTitle,
}) => {
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [customResolutions, setCustomResolutions] = useState<{ [id: string]: string }>({});
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [draftMessages, setDraftMessages] = useState<{ [id: string]: string }>({});
  const [loadingDraftId, setLoadingDraftId] = useState<string | null>(null);
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Filter items that have ambiguities
  const ambiguousItems = actionItems.filter(
    (item) => item.ambiguity?.isAmbiguous && !item.ambiguity?.resolvedValue
  );
  const resolvedItems = actionItems.filter((item) => item.ambiguity?.resolvedValue);

  // Default active item to first ambiguous item
  React.useEffect(() => {
    if (ambiguousItems.length > 0 && !activeItemId) {
      setActiveItemId(ambiguousItems[0].id);
    }
  }, [ambiguousItems, activeItemId]);

  const handleResolveWithText = async (itemId: string, resolutionText: string) => {
    if (!resolutionText.trim()) return;
    setResolvingId(itemId);
    try {
      await onResolveItem(itemId, resolutionText);
      setCustomResolutions((prev) => ({ ...prev, [itemId]: '' }));
    } catch (err) {
      console.error('Failed to resolve item:', err);
    } finally {
      setResolvingId(null);
    }
  };

  const handleGenerateDraft = async (item: ActionItem) => {
    setLoadingDraftId(item.id);
    try {
      const res = await fetch('/api/generate-clarification-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionItem: item, meetingTitle }),
      });
      const data = await res.json();
      if (data.draft) {
        setDraftMessages((prev) => ({ ...prev, [item.id]: data.draft }));
      }
    } catch (err) {
      console.error('Error generating clarification draft:', err);
    } finally {
      setLoadingDraftId(null);
    }
  };

  const handleCopyDraft = (itemId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraftId(itemId);
    setTimeout(() => setCopiedDraftId(null), 2500);
  };

  if (ambiguousItems.length === 0 && resolvedItems.length === 0) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center space-x-3 text-emerald-300 text-xs">
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <span className="font-semibold">Complete & Unambiguous:</span> All action items in this meeting have clearly assigned owners, grounded deadlines, and verified transcript quotes.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/90 rounded-2xl border border-amber-500/30 shadow-xl overflow-hidden backdrop-blur-md mb-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-4 sm:px-6 flex items-center justify-between border-b border-amber-500/20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Clarification Needed: Incomplete & Ambiguous Items
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                {ambiguousItems.length} pending
              </span>
              {resolvedItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-medium border border-emerald-500/40">
                  {resolvedItems.length} clarified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              The AI detected incomplete deliverables or unassigned duties in the transcript. Clarify them below to finalize calendar schedules.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition"
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 sm:p-6 space-y-5">
          {/* List of Ambiguous Items */}
          {ambiguousItems.map((item) => {
            const isSelected = activeItemId === item.id;
            const draftText = draftMessages[item.id];
            const currentResolution = customResolutions[item.id] || '';

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all ${
                  isSelected
                    ? 'border-amber-500/60 bg-slate-900/90 shadow-lg shadow-amber-500/5'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                } p-4 sm:p-5`}
              >
                {/* Item Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                      {item.ambiguity.type ? item.ambiguity.type.replace('_', ' ').toUpperCase() : 'AMBIGUOUS'}
                    </span>
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Category: {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Priority: {item.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Grounded Citation Excerpt */}
                {item.citation?.quote && (
                  <div className="mb-3.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center space-x-1 font-medium text-indigo-400">
                        <span>Transcript Excerpt</span>
                        {item.citation.speaker && <span>({item.citation.speaker})</span>}
                        {item.citation.timestamp && <span>at [{item.citation.timestamp}]</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => onJumpToQuote(item.citation.quote)}
                        className="text-[10px] text-slate-400 hover:text-indigo-300 transition underline underline-offset-2"
                      >
                        Highlight in Transcript
                      </button>
                    </div>
                    <blockquote className="italic text-slate-300 text-xs pl-2 border-l-2 border-indigo-500">
                      "{item.citation.quote}"
                    </blockquote>
                  </div>
                )}

                {/* Detection Explanation & Question */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-4">
                  <div className="flex items-start space-x-2.5">
                    <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        {item.ambiguity.explanation || 'This action item is missing key parameters to be actionable.'}
                      </p>
                      {item.ambiguity.clarificationQuestion && (
                        <p className="text-xs font-semibold text-amber-300 mt-1.5">
                          👉 Clarification Needed: {item.ambiguity.clarificationQuestion}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 1-Click Suggested Quick Resolutions */}
                {item.ambiguity.suggestedResolutions && item.ambiguity.suggestedResolutions.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center space-x-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>1-Click Suggested Resolutions:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.ambiguity.suggestedResolutions.map((suggestion, sIdx) => (
                        <button
                          key={sIdx}
                          type="button"
                          disabled={resolvingId === item.id}
                          onClick={() => handleResolveWithText(item.id, suggestion)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition hover:scale-[1.01] active:scale-[0.99] flex items-center space-x-1.5"
                        >
                          <span>{suggestion}</span>
                          <ArrowRight className="w-3 h-3 text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Custom Resolution Input */}
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    type="text"
                    value={currentResolution}
                    onChange={(e) =>
                      setCustomResolutions((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleResolveWithText(item.id, currentResolution);
                      }
                    }}
                    placeholder={`e.g. "Assign to Sarah, deadline Friday Nov 14 at 5pm"`}
                    className="flex-1 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    disabled={resolvingId === item.id}
                  />

                  <button
                    type="button"
                    disabled={!currentResolution.trim() || resolvingId === item.id}
                    onClick={() => handleResolveWithText(item.id, currentResolution)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition ${
                      currentResolution.trim() && resolvingId !== item.id
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {resolvingId === item.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Apply Resolution</span>
                  </button>
                </div>

                {/* Team Outreach Draft Accordion */}
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleGenerateDraft(item)}
                    disabled={loadingDraftId === item.id}
                    className="text-slate-400 hover:text-indigo-300 transition flex items-center space-x-1.5 text-[11px]"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {loadingDraftId === item.id
                        ? 'Generating Slack/Email inquiry...'
                        : draftText
                        ? 'Regenerate Slack/Email inquiry'
                        : 'Draft message to ask team for clarification'}
                    </span>
                  </button>
                </div>

                {/* Draft Message Display */}
                {draftText && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-800 relative">
                    <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400 font-medium">
                      <span>Ready-to-send Clarification Message:</span>
                      <button
                        onClick={() => handleCopyDraft(item.id, draftText)}
                        className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition"
                      >
                        {copiedDraftId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy to Clipboard</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-slate-300 text-xs font-sans whitespace-pre-wrap leading-relaxed select-all">
                      {draftText}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Resolved Items List (Can re-edit) */}
          {resolvedItems.length > 0 && (
            <div className="pt-4 border-t border-slate-700/60">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Resolved & Grounded Action Items ({resolvedItems.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {resolvedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-emerald-300">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        <span className="text-slate-300 font-medium">{item.assignee.name}</span> • Due: {item.deadline.raw}
                      </div>
                      <div className="text-[10px] text-emerald-400/90 mt-1 italic">
                        Resolution: {item.ambiguity.resolvedValue}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onManualUpdate(item.id, {
                          ambiguity: {
                            ...item.ambiguity,
                            resolvedValue: undefined,
                            isAmbiguous: true,
                          },
                        });
                      }}
                      className="text-[10px] text-slate-400 hover:text-amber-400 underline"
                    >
                      Re-clarify
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
