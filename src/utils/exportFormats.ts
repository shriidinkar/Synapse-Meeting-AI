import { MeetingAnalysis } from '../types/meeting';

export function formatAsMarkdown(analysis: MeetingAnalysis): string {
  const lines: string[] = [];

  lines.push(`# ${analysis.title}`);
  lines.push(`**Date:** ${analysis.meetingDate} | **Sentiment:** ${analysis.sentiment.toUpperCase()}`);
  lines.push('');

  lines.push(`## 📌 Executive Summary`);
  lines.push(analysis.executiveSummary);
  lines.push('');

  if (analysis.participants && analysis.participants.length > 0) {
    lines.push(`### 👥 Participants`);
    lines.push(
      analysis.participants
        .map((p) => `- **${p.name}** (${p.actionsAssignedCount} action items, ${p.decisionsInvolvedCount} decisions)`)
        .join('\n')
    );
    lines.push('');
  }

  lines.push(`## 🎯 Decisions Made`);
  if (analysis.decisions.length === 0) {
    lines.push(`_No explicit decisions recorded._`);
  } else {
    analysis.decisions.forEach((d, i) => {
      lines.push(`### ${i + 1}. ${d.title}`);
      lines.push(`- **Decided by:** ${d.decidedBy}`);
      lines.push(`- **Impact Area:** ${d.impactArea}`);
      lines.push(`- **Rationale:** ${d.rationale}`);
      if (d.citation?.quote) {
        lines.push(`- **Transcript Quote:** "${d.citation.quote}" — _${d.citation.speaker}_`);
      }
      lines.push('');
    });
  }

  lines.push(`## ✅ Action Items & Tasks`);
  if (analysis.actionItems.length === 0) {
    lines.push(`_No action items recorded._`);
  } else {
    analysis.actionItems.forEach((item, i) => {
      const checkbox = item.status === 'completed' ? '[x]' : '[ ]';
      const assigneeStr = item.assignee.isAmbiguous ? `⚠️ ${item.assignee.name} (Unclear)` : item.assignee.name;
      const deadlineStr = item.deadline.isAmbiguous ? `⚠️ ${item.deadline.raw} (Fuzzy)` : item.deadline.raw;

      lines.push(`- ${checkbox} **${item.title}**`);
      lines.push(`  - **Assignee:** ${assigneeStr}`);
      lines.push(`  - **Deadline:** ${deadlineStr} ${item.deadline.isoDate ? `(${item.deadline.isoDate.split('T')[0]})` : ''}`);
      lines.push(`  - **Priority:** ${item.priority.toUpperCase()} | **Category:** ${item.category}`);
      if (item.description) {
        lines.push(`  - **Details:** ${item.description}`);
      }
      if (item.ambiguity?.isAmbiguous && !item.ambiguity.resolvedValue) {
        lines.push(`  - ⚠️ **Needs Clarification:** ${item.ambiguity.explanation}`);
      } else if (item.ambiguity?.resolvedValue) {
        lines.push(`  - ✅ **Clarification Resolved:** ${item.ambiguity.resolvedValue}`);
      }
      if (item.citation?.quote) {
        lines.push(`  - **Grounded Quote:** "${item.citation.quote}" — _${item.citation.speaker}_`);
      }
    });
    lines.push('');
  }

  if (analysis.followUps && analysis.followUps.length > 0) {
    lines.push(`## 🔄 Follow-ups & Next Steps`);
    analysis.followUps.forEach((f) => {
      lines.push(`- **[${f.type.replace('_', ' ').toUpperCase()}] ${f.title}**: ${f.description}`);
      if (f.suggestedTimeline) lines.push(`  - Suggested Timeline: ${f.suggestedTimeline}`);
    });
    lines.push('');
  }

  lines.push(`---`);
  lines.push(`*Generated autonomously by Synapse Meeting AI. Grounded in transcript citations.*`);

  return lines.join('\n');
}

export function formatAsCsv(analysis: MeetingAnalysis): string {
  const headers = ['ID', 'Task Title', 'Assignee', 'Assignee Ambiguous', 'Deadline', 'Deadline ISO', 'Priority', 'Category', 'Status', 'Ambiguity Note', 'Transcript Quote', 'Speaker'];
  const rows = analysis.actionItems.map((item) => {
    return [
      item.id,
      item.title,
      item.assignee.name,
      item.assignee.isAmbiguous ? 'YES' : 'NO',
      item.deadline.raw,
      item.deadline.isoDate || '',
      item.priority,
      item.category,
      item.status,
      item.ambiguity.isAmbiguous ? (item.ambiguity.resolvedValue ? `Resolved: ${item.ambiguity.resolvedValue}` : item.ambiguity.explanation || 'Needs clarification') : 'Clear',
      item.citation?.quote || '',
      item.citation?.speaker || '',
    ].map((val) => `"${String(val).replace(/"/g, '""')}"`);
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
