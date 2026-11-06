import React, { useState, useRef } from 'react';
import { Upload, Sparkles, FileText, CheckCircle2, AlertCircle, ArrowRight, Clock, Calendar as CalendarIcon, ShieldCheck } from 'lucide-react';
import { SAMPLE_TRANSCRIPTS, SampleTranscript } from '../data/sampleTranscripts';

interface TranscriptInputProps {
  onAnalyze: (transcript: string, meetingDate: string, meetingTitle: string) => void;
  isLoading: boolean;
}

export const TranscriptInput: React.FC<TranscriptInputProps> = ({ onAnalyze, isLoading }) => {
  const [transcript, setTranscript] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Parsing speech segments and speaker dialogue...',
    'Extracting decisions and binding agreements...',
    'Identifying tasks, assignees, and deadlines...',
    'Auditing for incomplete or ambiguous action items...',
    'Cross-referencing quotes to ensure zero hallucinations...',
  ];

  React.useEffect(() => {
    let interval: any;
    if (isLoading) {
      setProgressStep(0);
      interval = setInterval(() => {
        setProgressStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSelectSample = (sample: SampleTranscript) => {
    setSelectedSampleId(sample.id);
    setTranscript(sample.content);
    setMeetingTitle(sample.title);
    setMeetingDate(sample.meetingDate);
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setTranscript(text);
        if (!meetingTitle) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setMeetingTitle(cleanName);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) return;
    onAnalyze(transcript.trim(), meetingDate, meetingTitle.trim());
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Welcome */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Autonomous Anti-Hallucination Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Turn Raw Meeting Transcripts into <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">Actionable Outcomes</span>
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
          Autonomously extracts verified summaries, decisions, grounded action items with calendar exports, and interactively requests clarification for incomplete tasks.
        </p>
      </div>

      {/* Sample Selector Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Start with Realistic Transcripts</span>
          </span>
          <span className="text-[11px] text-slate-500">Includes nuanced ambiguities & decisions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_TRANSCRIPTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                selectedSampleId === sample.id
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-md shadow-indigo-500/10'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                  {sample.category}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{sample.meetingDate}</span>
                </span>
              </div>
              <h3 className="font-semibold text-slate-200 text-xs line-clamp-1">{sample.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{sample.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800/80 rounded-2xl border border-slate-700 shadow-2xl p-5 md:p-6 backdrop-blur-sm">
        {/* Metadata Row: Title & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Meeting Title <span className="text-slate-500 text-[11px]">(Optional, auto-detected if empty)</span>
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g. Q4 Sprint Planning, Security Architecture Review..."
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Meeting Date <span className="text-slate-500 text-[11px]">(For relative deadlines)</span>
            </label>
            <input
              type="date"
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Transcript Textarea / Drag & Drop */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Meeting Transcript</span>
            </label>
            <div className="flex items-center space-x-3 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="hover:text-indigo-300 transition flex items-center space-x-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload file (.txt, .vtt, .srt)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.vtt,.srt,.json,.md"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              {transcript && (
                <button
                  type="button"
                  onClick={() => {
                    setTranscript('');
                    setSelectedSampleId(null);
                  }}
                  className="hover:text-red-400 transition"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragActive(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative rounded-xl border transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-700 bg-slate-900/90'
            }`}
          >
            <textarea
              rows={9}
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                setSelectedSampleId(null);
              }}
              placeholder={`Paste your raw meeting transcript here, including speakers and timestamps if available.\n\nExample:\n[00:15] Maya: Let's ship Team Spaces before Thanksgiving.\n[01:00] David: I will implement the WebSocket reconnection fallback by next Tuesday, Nov 10th.\n[02:30] Maya: Someone really needs to build the telemetry pipeline soon.`}
              className="w-full p-4 bg-transparent text-slate-200 placeholder-slate-500 text-xs font-mono leading-relaxed focus:outline-none resize-y"
              disabled={isLoading}
            />

            {dragActive && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center rounded-xl pointer-events-none">
                <Upload className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                <span className="text-xs text-white font-medium">Drop your transcript file here</span>
              </div>
            )}
          </div>
        </div>

        {/* Processing State or Submit Button */}
        {isLoading ? (
          <div className="rounded-xl bg-indigo-950/40 border border-indigo-500/30 p-4">
            <div className="flex items-center space-x-3 mb-2.5">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-indigo-300">
                Autonomous Analysis in Progress...
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-1.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((progressStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-300 flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>{steps[progressStep]}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-hallucination guarantee: Quotes and attributions are strictly grounded.</span>
            </div>

            <button
              type="submit"
              disabled={!transcript.trim()}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${
                transcript.trim()
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Analyze & Extract Actions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
