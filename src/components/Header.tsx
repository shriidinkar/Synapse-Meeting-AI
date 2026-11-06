import React from 'react';
import { Sparkles, Calendar, Download, RefreshCw, FileText, CheckCircle2, ShieldCheck, ChevronDown } from 'lucide-react';
import { MeetingAnalysis } from '../types/meeting';
import { generateMeetingBundleIcs, downloadIcsFile } from '../utils/calendarExport';
import { formatAsMarkdown, formatAsCsv, downloadTextFile } from '../utils/exportFormats';

interface HeaderProps {
  analysis: MeetingAnalysis | null;
  onReset: () => void;
  onOpenCalendarModal: () => void;
  onSelectSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  analysis,
  onReset,
  onOpenCalendarModal,
  onSelectSample,
}) => {
  const [exportDropdownOpen, setExportDropdownOpen] = React.useState(false);

  const ambiguousCount = analysis?.actionItems.filter(
    (a) => a.ambiguity?.isAmbiguous && !a.ambiguity?.resolvedValue
  ).length || 0;

  const handleExportIcsBundle = () => {
    if (!analysis) return;
    const ics = generateMeetingBundleIcs(analysis);
    const cleanTitle = analysis.title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
    downloadIcsFile(`${cleanTitle}_Schedule.ics`, ics);
    setExportDropdownOpen(false);
  };

  const handleExportMarkdown = () => {
    if (!analysis) return;
    const md = formatAsMarkdown(analysis);
    downloadTextFile(`${analysis.title.replace(/\s+/g, '_')}_summary.md`, md);
    setExportDropdownOpen(false);
  };

  const handleExportCsv = () => {
    if (!analysis) return;
    const csv = formatAsCsv(analysis);
    downloadTextFile(`${analysis.title.replace(/\s+/g, '_')}_action_items.csv`, csv, 'text/csv;charset=utf-8');
    setExportDropdownOpen(false);
  };

  const handleExportJson = () => {
    if (!analysis) return;
    const jsonStr = JSON.stringify(analysis, null, 2);
    downloadTextFile(`${analysis.title.replace(/\s+/g, '_')}_analysis.json`, jsonStr, 'application/json');
    setExportDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Synapse
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-medium">
                Autonomous Meeting Intelligence
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Grounded in Transcript</span>
              <span className="text-slate-600">•</span>
              <span>Zero Hallucinations</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {analysis ? (
            <>
              {ambiguousCount > 0 && (
                <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse">
                  <span>⚠️</span>
                  <span>{ambiguousCount} Incomplete Items</span>
                </div>
              )}

              {/* Secure Calendar Export Button */}
              <button
                onClick={onOpenCalendarModal}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" />
                <span>Export to Calendar</span>
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Exports</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {exportDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-1.5 z-50 text-xs"
                    onMouseLeave={() => setExportDropdownOpen(false)}
                  >
                    <button
                      onClick={handleExportIcsBundle}
                      className="w-full px-4 py-2 text-left hover:bg-slate-700/80 flex items-center space-x-2.5 text-slate-200"
                    >
                      <Calendar className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="font-medium">Calendar (.ICS bundle)</div>
                        <div className="text-[10px] text-slate-400">Google, Apple, Outlook</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full px-4 py-2 text-left hover:bg-slate-700/80 flex items-center space-x-2.5 text-slate-200"
                    >
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-medium">Markdown Recap (.md)</div>
                        <div className="text-[10px] text-slate-400">For Notion, Slack & Docs</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportCsv}
                      className="w-full px-4 py-2 text-left hover:bg-slate-700/80 flex items-center space-x-2.5 text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-medium">Action Items (.CSV)</div>
                        <div className="text-[10px] text-slate-400">For Jira, Linear, Excel</div>
                      </div>
                    </button>
                    <button
                      onClick={handleExportJson}
                      className="w-full px-4 py-2 text-left hover:bg-slate-700/80 flex items-center space-x-2.5 text-slate-200"
                    >
                      <Download className="w-4 h-4 text-violet-400" />
                      <div>
                        <div className="font-medium">Structured JSON (.json)</div>
                        <div className="text-[10px] text-slate-400">Full schema & metadata</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Reset / New Analysis */}
              <button
                onClick={onReset}
                title="Start new analysis"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onSelectSample}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition"
            >
              Try Sample Meetings
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
