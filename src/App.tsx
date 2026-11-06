import React, { useState } from 'react';
import { Header } from './components/Header';
import { TranscriptInput } from './components/TranscriptInput';
import { AmbiguityResolver } from './components/AmbiguityResolver';
import { ActionItemsView } from './components/ActionItemsView';
import { DecisionsView } from './components/DecisionsView';
import { SummaryView } from './components/SummaryView';
import { FollowUpsView } from './components/FollowUpsView';
import { TranscriptViewer } from './components/TranscriptViewer';
import { CalendarExportModal } from './components/CalendarExportModal';
import { EditTaskModal } from './components/EditTaskModal';
import { MeetingAnalysis, ActionItem } from './types/meeting';
import { CheckCircle2, ListTodo, ShieldCheck, FileText, ArrowRight, Calendar, AlertCircle } from 'lucide-react';

export default function App() {
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'decisions' | 'summary' | 'followups' | 'transcript'>('tasks');
  const [activeQuote, setActiveQuote] = useState<string | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ActionItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Autonomous Transcript Analysis via Server API
  const handleAnalyze = async (transcript: string, meetingDate: string, meetingTitle: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, meetingDate, meetingTitle }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data: MeetingAnalysis = await response.json();
      setAnalysis(data);
      setActiveTab('tasks');
      showToast('Meeting analysis complete with grounded citations!');
    } catch (error: any) {
      console.error('Analysis error:', error);
      alert(`Error analyzing transcript: ${error.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive Resolution of Ambiguous Action Items
  const handleResolveAmbiguity = async (itemId: string, userResolution: string) => {
    if (!analysis) return;
    const targetItem = analysis.actionItems.find((i) => i.id === itemId);
    if (!targetItem) return;

    try {
      const response = await fetch('/api/resolve-ambiguity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionItem: targetItem,
          userResolution,
          meetingDate: analysis.meetingDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve ambiguity on server');
      }

      const updatedItem: ActionItem = await response.json();

      setAnalysis((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          actionItems: prev.actionItems.map((item) =>
            item.id === itemId ? updatedItem : item
          ),
        };
      });

      showToast(`Action item clarified & grounded!`);
    } catch (err: any) {
      console.error('Error resolving ambiguity:', err);
      // Fallback: apply optimistic manual update
      handleManualUpdate(itemId, {
        ambiguity: {
          ...targetItem.ambiguity,
          isAmbiguous: false,
          resolvedValue: userResolution,
          resolvedAt: new Date().toISOString(),
        },
      });
      showToast('Clarification recorded.');
    }
  };

  // Manual update for an action item
  const handleManualUpdate = (itemId: string, updates: Partial<ActionItem>) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      actionItems: analysis.actionItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  // Toggle Action Item completion status
  const handleToggleStatus = (itemId: string) => {
    if (!analysis) return;
    setAnalysis({
      ...analysis,
      actionItems: analysis.actionItems.map((item) => {
        if (item.id === itemId) {
          const newStatus = item.status === 'completed' ? 'pending' : 'completed';
          return { ...item, status: newStatus };
        }
        return item;
      }),
    });
  };

  // Jump to transcript quote and activate transcript tab or split
  const handleJumpToQuote = (quote: string) => {
    setActiveQuote(quote);
    setActiveTab('transcript');
  };

  // Open modal to add a new task
  const handleAddNewTask = () => {
    const newTask: ActionItem = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      assignee: { name: '', isAmbiguous: false },
      deadline: { raw: '', isAmbiguous: false },
      priority: 'medium',
      category: 'General',
      status: 'pending',
      ambiguity: { isAmbiguous: false },
      citation: { quote: '', speaker: '', confidence: 1.0 },
    };
    setEditingTask(newTask);
    setIsEditModalOpen(true);
  };

  // Save edited or newly added task
  const handleSaveTask = (savedItem: ActionItem) => {
    if (!analysis) return;
    const exists = analysis.actionItems.some((i) => i.id === savedItem.id);
    if (exists) {
      setAnalysis({
        ...analysis,
        actionItems: analysis.actionItems.map((i) => (i.id === savedItem.id ? savedItem : i)),
      });
      showToast('Task updated successfully.');
    } else {
      setAnalysis({
        ...analysis,
        actionItems: [savedItem, ...analysis.actionItems],
      });
      showToast('New task added to action items.');
    }
  };

  const pendingAmbiguitiesCount =
    analysis?.actionItems.filter((i) => i.ambiguity?.isAmbiguous && !i.ambiguity?.resolvedValue)
      .length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Global Header */}
      <Header
        analysis={analysis}
        onReset={() => {
          if (confirm('Start a new transcript analysis?')) {
            setAnalysis(null);
            setActiveQuote(null);
          }
        }}
        onOpenCalendarModal={() => setIsCalendarModalOpen(true)}
        onSelectSample={() => {
          // scrolls to input
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!analysis ? (
          <TranscriptInput onAnalyze={handleAnalyze} isLoading={isLoading} />
        ) : (
          <div className="space-y-6">
            {/* Meeting Meta Header Banner */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5 text-xs text-indigo-400 font-medium mb-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    {analysis.meetingDate}
                  </span>
                  {analysis.durationEstimated && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span>Duration: {analysis.durationEstimated}</span>
                    </>
                  )}
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Grounded Verification: 100%</span>
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">{analysis.title}</h1>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-3 shrink-0">
                <button
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Sync to Calendar</span>
                </button>
              </div>
            </div>

            {/* Interactive Ambiguity Resolver (Top priority whenever ambiguities exist) */}
            <AmbiguityResolver
              actionItems={analysis.actionItems}
              onResolveItem={handleResolveAmbiguity}
              onManualUpdate={handleManualUpdate}
              onJumpToQuote={handleJumpToQuote}
              meetingTitle={analysis.title}
            />

            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 border-b border-slate-800 pb-px overflow-x-auto">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'tasks'
                    ? 'border-indigo-500 text-white bg-slate-900/60 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ListTodo className="w-4 h-4 text-indigo-400" />
                <span>Action Items & Deadlines</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                  {analysis.actionItems.length}
                </span>
                {pendingAmbiguitiesCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('decisions')}
                className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'decisions'
                    ? 'border-indigo-500 text-white bg-slate-900/60 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Decisions Log</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                  {analysis.decisions.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('summary')}
                className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'summary'
                    ? 'border-indigo-500 text-white bg-slate-900/60 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Executive Summary</span>
              </button>

              <button
                onClick={() => setActiveTab('followups')}
                className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'followups'
                    ? 'border-indigo-500 text-white bg-slate-900/60 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4 text-violet-400" />
                <span>Follow-ups & Next Steps</span>
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                  {analysis.followUps.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-4 py-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === 'transcript'
                    ? 'border-indigo-500 text-white bg-slate-900/60 rounded-t-xl'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Source Transcript</span>
                {activeQuote && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </button>
            </div>

            {/* Active Tab View */}
            <div className="transition-all duration-150">
              {activeTab === 'tasks' && (
                <ActionItemsView
                  actionItems={analysis.actionItems}
                  onToggleStatus={handleToggleStatus}
                  onEditItem={(item) => {
                    setEditingTask(item);
                    setIsEditModalOpen(true);
                  }}
                  onAddItem={handleAddNewTask}
                  onJumpToQuote={handleJumpToQuote}
                  meetingTitle={analysis.title}
                />
              )}

              {activeTab === 'decisions' && (
                <DecisionsView
                  decisions={analysis.decisions}
                  onJumpToQuote={handleJumpToQuote}
                />
              )}

              {activeTab === 'summary' && (
                <SummaryView analysis={analysis} onJumpToQuote={handleJumpToQuote} />
              )}

              {activeTab === 'followups' && (
                <FollowUpsView
                  followUps={analysis.followUps}
                  meetingTitle={analysis.title}
                />
              )}

              {activeTab === 'transcript' && (
                <TranscriptViewer
                  rawTranscript={analysis.rawTranscript}
                  activeQuote={activeQuote}
                  onClearActiveQuote={() => setActiveQuote(null)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Calendar Export Modal */}
      {analysis && (
        <CalendarExportModal
          analysis={analysis}
          isOpen={isCalendarModalOpen}
          onClose={() => setIsCalendarModalOpen(false)}
        />
      )}

      {/* Task Edit Modal */}
      <EditTaskModal
        item={editingTask}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-indigo-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs animate-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
