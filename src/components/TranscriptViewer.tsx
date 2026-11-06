import React, { useState, useEffect, useRef } from 'react';
import { Search, ShieldCheck, Clock, User, Copy, Check } from 'lucide-react';

interface TranscriptViewerProps {
  rawTranscript: string;
  activeQuote: string | null;
  onClearActiveQuote: () => void;
}

interface ParsedLine {
  id: string;
  speaker?: string;
  timestamp?: string;
  text: string;
  raw: string;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  rawTranscript,
  activeQuote,
  onClearActiveQuote,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightedRef = useRef<HTMLDivElement>(null);

  // Parse lines into timestamp, speaker, and speech
  const parsedLines: ParsedLine[] = React.useMemo(() => {
    const rawLines = rawTranscript.split('\n').filter((l) => l.trim().length > 0);

    return rawLines.map((line, index) => {
      // Regex pattern matching: [00:45] Name (Role): speech OR Name: speech
      const match = line.match(/^(\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*)?([^:]+?):\s*(.+)$/);

      if (match) {
        return {
          id: `line-${index}`,
          timestamp: match[2] || undefined,
          speaker: match[3]?.trim(),
          text: match[4]?.trim(),
          raw: line,
        };
      }

      return {
        id: `line-${index}`,
        text: line,
        raw: line,
      };
    });
  }, [rawTranscript]);

  // Scroll to active quote when requested
  useEffect(() => {
    if (activeQuote && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeQuote]);

  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(rawTranscript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header & Search */}
      <div className="p-4 sm:p-5 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-white tracking-tight">Transcript Source Inspector</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Grounded Citation Source</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Original dialogue verified with zero synthetic interpolations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* In-transcript Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyTranscript}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Copy entire transcript"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Active Quote Highlight Banner */}
      {activeQuote && (
        <div className="bg-indigo-950/60 border-b border-indigo-500/40 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>
              Inspecting Quote: <em className="text-white">"{activeQuote.slice(0, 70)}..."</em>
            </span>
          </div>
          <button
            onClick={onClearActiveQuote}
            className="text-[11px] text-slate-400 hover:text-white underline ml-2"
          >
            Clear Highlight
          </button>
        </div>
      )}

      {/* Transcript Scroll Area */}
      <div
        ref={containerRef}
        className="max-h-[550px] overflow-y-auto p-4 sm:p-5 font-mono text-xs space-y-2.5 bg-slate-950/50"
      >
        {parsedLines.map((line) => {
          // Check if this line matches the active citation quote
          const isHighlighted =
            activeQuote &&
            (line.raw.toLowerCase().includes(activeQuote.toLowerCase().trim()) ||
              (activeQuote.length > 25 &&
                line.text?.toLowerCase().includes(activeQuote.slice(0, 25).toLowerCase())));

          // Search term filtering
          const matchesSearch =
            !searchTerm || line.raw.toLowerCase().includes(searchTerm.toLowerCase());

          if (!matchesSearch) return null;

          return (
            <div
              key={line.id}
              ref={isHighlighted ? highlightedRef : null}
              className={`p-2.5 rounded-lg transition-all border ${
                isHighlighted
                  ? 'bg-indigo-950/80 border-indigo-400 shadow-md shadow-indigo-500/20 text-white ring-2 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {line.timestamp && (
                  <span className="text-[10px] text-slate-500 font-sans px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{line.timestamp}</span>
                  </span>
                )}
                {line.speaker && (
                  <span className="text-xs font-bold text-indigo-300 font-sans flex items-center space-x-1">
                    <User className="w-3 h-3 text-indigo-400" />
                    <span>{line.speaker}</span>
                  </span>
                )}
                {isHighlighted && (
                  <span className="text-[10px] font-sans font-semibold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40 ml-auto">
                    Active Grounded Citation
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed font-sans text-slate-200 pl-1">
                {line.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
