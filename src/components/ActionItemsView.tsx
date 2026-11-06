import React, { useState } from 'react';
import { CheckCircle2, Circle, Calendar, User, Clock, AlertTriangle, ExternalLink, Download, Plus, Edit2, ShieldCheck, Tag, Filter, Check } from 'lucide-react';
import { ActionItem, Priority } from '../types/meeting';
import { generateGoogleCalendarUrl, generateOutlookCalendarUrl, generateSingleActionItemIcs, downloadIcsFile } from '../utils/calendarExport';

interface ActionItemsViewProps {
  actionItems: ActionItem[];
  onToggleStatus: (itemId: string) => void;
  onEditItem: (item: ActionItem) => void;
  onAddItem: () => void;
  onJumpToQuote: (quote: string) => void;
  meetingTitle: string;
}

export const ActionItemsView: React.FC<ActionItemsViewProps> = ({
  actionItems,
  onToggleStatus,
  onEditItem,
  onAddItem,
  onJumpToQuote,
  meetingTitle,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'ambiguous'>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  // Extract unique assignees for filtering
  const assignees = Array.from(new Set(actionItems.map((item) => item.assignee.name))).filter(Boolean);

  const filteredItems = actionItems.filter((item) => {
    if (statusFilter === 'pending' && item.status === 'completed') return false;
    if (statusFilter === 'completed' && item.status !== 'completed') return false;
    if (statusFilter === 'ambiguous' && (!item.ambiguity?.isAmbiguous || !!item.ambiguity?.resolvedValue)) return false;

    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && item.assignee.name !== assigneeFilter) return false;

    return true;
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'high':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'medium':
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
      case 'low':
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600/40';
    }
  };

  const handleDownloadSingleIcs = (item: ActionItem) => {
    const ics = generateSingleActionItemIcs(item, meetingTitle);
    const cleanTitle = item.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    downloadIcsFile(`task_${cleanTitle}.ics`, ics);
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* View Header with Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Assigned Tasks & Action Items</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
              {actionItems.length} total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded commitments with verified assignees, deadlines, and direct calendar synchronization.
          </p>
        </div>

        <button
          onClick={onAddItem}
          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition hover:scale-[1.02] active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900/60 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 text-[11px] font-medium mr-1 flex items-center">
            <Filter className="w-3 h-3 mr-1" /> Status:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All ({actionItems.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'pending'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Pending ({actionItems.filter((i) => i.status !== 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('ambiguous')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'ambiguous'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
            }`}
          >
            Ambiguous ({actionItems.filter((i) => i.ambiguity?.isAmbiguous && !i.ambiguity?.resolvedValue).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Completed ({actionItems.filter((i) => i.status === 'completed').length})
          </button>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-2">
          {assignees.length > 0 && (
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none"
            >
              <option value="all">All Assignees</option>
              {assignees.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-xs focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      <div className="divide-y divide-slate-700/60">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No action items match the selected filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = item.status === 'completed';
            const isAmbiguous = item.ambiguity?.isAmbiguous && !item.ambiguity?.resolvedValue;
            const googleCalUrl = generateGoogleCalendarUrl(item, meetingTitle);
            const outlookCalUrl = generateOutlookCalendarUrl(item, meetingTitle);

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 transition hover:bg-slate-750/30 ${
                  isCompleted ? 'bg-slate-900/30 opacity-75' : ''
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => onToggleStatus(item.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition shrink-0"
                    title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-semibold text-white ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {item.title}
                        </span>
                        {isAmbiguous && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Needs Clarification</span>
                          </span>
                        )}
                        {item.ambiguity?.resolvedValue && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                            <Check className="w-3 h-3" />
                            <span>Clarified</span>
                          </span>
                        )}
                      </div>

                      {/* Badges: Category & Priority */}
                      <div className="flex items-center space-x-1.5 shrink-0 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-750 text-slate-300 border border-slate-700">
                          {item.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-medium border ${getPriorityColor(
                            item.priority
                          )}`}
                        >
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Metadata Strip: Assignee, Deadline, Citation */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 pt-1">
                      {/* Assignee */}
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-medium text-slate-200">
                          {item.assignee.name || 'Unassigned'}
                        </span>
                        {item.assignee.role && (
                          <span className="text-[11px] text-slate-400">({item.assignee.role})</span>
                        )}
                      </div>

                      {/* Deadline */}
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-slate-200 font-medium">
                          {item.deadline.raw}
                        </span>
                        {item.deadline.isoDate && (
                          <span className="text-[11px] text-slate-400">
                            ({item.deadline.isoDate.split('T')[0]})
                          </span>
                        )}
                      </div>

                      {/* Transcript Quote Citation Link */}
                      {item.citation?.quote && (
                        <button
                          type="button"
                          onClick={() => onJumpToQuote(item.citation.quote)}
                          className="flex items-center space-x-1 text-indigo-400 hover:text-indigo-300 transition text-[11px] underline underline-offset-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Quote: "{item.citation.quote.slice(0, 35)}..."</span>
                        </button>
                      )}
                    </div>

                    {/* Ambiguity Resolution Note if Resolved */}
                    {item.ambiguity?.resolvedValue && (
                      <div className="mt-2 text-[11px] text-emerald-300 bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-500/20 flex items-center space-x-1.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Resolution applied: {item.ambiguity.resolvedValue}</span>
                      </div>
                    )}

                    {/* Action Toolbar: Calendar Export & Edit */}
                    <div className="mt-3 pt-2.5 border-t border-slate-750/70 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        {/* Direct Google Calendar Export */}
                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium flex items-center space-x-1 transition"
                          title="Open Google Calendar with this task"
                        >
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          <span>Google Calendar</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>

                        {/* Direct Outlook Web Export */}
                        <a
                          href={outlookCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-[11px] font-medium flex items-center space-x-1 transition"
                          title="Open Microsoft Outlook Web with this task"
                        >
                          <span>Outlook Web</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>

                        {/* Direct .ICS File Download */}
                        <button
                          type="button"
                          onClick={() => handleDownloadSingleIcs(item)}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center space-x-1 transition"
                          title="Download universal .ics file for Apple Calendar or Outlook"
                        >
                          <Download className="w-3 h-3 text-slate-400" />
                          <span>Download .ICS</span>
                        </button>
                      </div>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="text-slate-400 hover:text-white text-[11px] font-medium flex items-center space-x-1 transition px-2 py-1 rounded hover:bg-slate-750"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Task</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
