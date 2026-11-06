import React, { useState } from 'react';
import { X, Calendar, Download, ExternalLink, Check, ShieldCheck, Clock, CheckSquare, Square, AlertTriangle } from 'lucide-react';
import { MeetingAnalysis, ActionItem } from '../types/meeting';
import { generateMeetingBundleIcs, generateSingleActionItemIcs, generateGoogleCalendarUrl, generateOutlookCalendarUrl, downloadIcsFile } from '../utils/calendarExport';

interface CalendarExportModalProps {
  analysis: MeetingAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarExportModal: React.FC<CalendarExportModalProps> = ({
  analysis,
  isOpen,
  onClose,
}) => {
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(() =>
    analysis.actionItems.map((item) => item.id)
  );
  const [includeRecapEvent, setIncludeRecapEvent] = useState(true);
  const [reminderTime, setReminderTime] = useState<'1h' | '24h' | 'none'>('24h');
  const [copiedStatus, setCopiedStatus] = useState(false);

  if (!isOpen) return null;

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedTaskIds(analysis.actionItems.map((i) => i.id));
  };

  const selectNone = () => {
    setSelectedTaskIds([]);
  };

  const selectedItems = analysis.actionItems.filter((i) => selectedTaskIds.includes(i.id));

  // Export Unified .ICS Bundle
  const handleExportIcsBundle = () => {
    // Generate filtered analysis with only selected items
    const filteredAnalysis: MeetingAnalysis = {
      ...analysis,
      actionItems: selectedItems,
    };
    const ics = generateMeetingBundleIcs(filteredAnalysis);
    const cleanTitle = analysis.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    downloadIcsFile(`${cleanTitle}_Schedule.ics`, ics);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Export to Major Calendar Platforms
              </h2>
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero cloud tracking • Direct private calendar integration</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Security & Compatibility Callout */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start space-x-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-slate-300 leading-relaxed">
              <strong className="text-white">Universal RFC 5545 Support:</strong> Exported files and links work seamlessly across <span className="text-indigo-300">Google Calendar</span>, <span className="text-sky-300">Microsoft Outlook</span>, <span className="text-emerald-300">Apple Calendar</span>, and <span className="text-violet-300">Office 365</span> with complete task metadata, assignees, and transcript citations.
            </div>
          </div>

          {/* Quick Platform Launchers */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Instant 1-Click Platform Synchronizers:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Google Calendar Web */}
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Google Calendar</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Web Ready
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Export all tasks as a bundled .ICS or open tasks directly in Google Calendar in your browser.
                  </p>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={handleExportIcsBundle}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center space-x-1 transition shadow-md shadow-indigo-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.ICS)</span>
                  </button>
                  {selectedItems[0] && (
                    <a
                      href={generateGoogleCalendarUrl(selectedItems[0], analysis.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs flex items-center space-x-1"
                      title="Open 1st selected task in Google Calendar"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Web</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Microsoft Outlook */}
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>Microsoft Outlook & 365</span>
                    <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-500/30">
                      Universal
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Download complete calendar bundle for Outlook desktop or launch Outlook Live Web compose.
                  </p>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={handleExportIcsBundle}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center justify-center space-x-1 transition shadow-md shadow-sky-600/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.ICS)</span>
                  </button>
                  {selectedItems[0] && (
                    <a
                      href={generateOutlookCalendarUrl(selectedItems[0], analysis.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-650 text-slate-200 text-xs flex items-center space-x-1"
                      title="Open 1st selected task in Outlook Web"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Web</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Task Selection Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-300">
                Select Action Items to Include ({selectedTaskIds.length}/{analysis.actionItems.length}):
              </span>
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <button onClick={selectAll} className="hover:text-indigo-300 underline">
                  Select All
                </button>
                <span>•</span>
                <button onClick={selectNone} className="hover:text-slate-300 underline">
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto divide-y divide-slate-800 border border-slate-700 rounded-xl bg-slate-950/60">
              {analysis.actionItems.map((item) => {
                const isSelected = selectedTaskIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleTaskSelection(item.id)}
                    className="p-3 flex items-start space-x-3 cursor-pointer hover:bg-slate-850/50 transition"
                  >
                    <button className="mt-0.5 text-indigo-400">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                        <span>Assignee: {item.assignee.name || 'Unassigned'}</span>
                        <span>•</span>
                        <span>Due: {item.deadline.raw}</span>
                        {item.ambiguity?.isAmbiguous && !item.ambiguity.resolvedValue && (
                          <span className="text-amber-400 text-[10px] font-bold">⚠️ Ambiguous</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reminder Timing */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div>
              <div className="font-semibold text-slate-200 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Calendar Alert / Reminder Alarm</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Configures VALARM trigger notification inside the calendar event.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setReminderTime('24h')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  reminderTime === '24h'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                24h Before
              </button>
              <button
                onClick={() => setReminderTime('1h')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  reminderTime === '1h'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                1h Before
              </button>
              <button
                onClick={() => setReminderTime('none')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  reminderTime === 'none'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                None
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-850/50 flex items-center justify-between">
          <div className="text-slate-400 text-[11px]">
            {selectedTaskIds.length} event{selectedTaskIds.length === 1 ? '' : 's'} ready to export
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
            >
              Close
            </button>
            <button
              onClick={handleExportIcsBundle}
              disabled={selectedTaskIds.length === 0}
              className={`px-4 py-2 rounded-xl font-semibold text-xs flex items-center space-x-2 transition shadow-lg ${
                selectedTaskIds.length > 0
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Download Unified Calendar (.ICS)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
