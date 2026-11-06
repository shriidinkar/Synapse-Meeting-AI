import { ActionItem, MeetingAnalysis } from '../types/meeting';

/**
 * Format a Date object to iCalendar / Google Calendar UTC format: YYYYMMDDTHHmmssZ
 */
function formatUtcForCalendar(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Escape text for iCalendar RFC 5545 specifications
 */
function escapeIcsText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Parse an ISO date string or relative deadline into start and end Dates for an action item.
 * Defaults to 1 hour duration. If no valid date is provided, defaults to next business day at 17:00.
 */
export function getActionItemDates(item: ActionItem): { startDate: Date; endDate: Date } {
  let targetDate: Date;

  if (item.deadline.isoDate) {
    targetDate = new Date(item.deadline.isoDate);
    if (isNaN(targetDate.getTime())) {
      targetDate = getDefaultFutureDate();
    }
  } else {
    targetDate = getDefaultFutureDate();
  }

  // End date is set to deadline time, start date is 1 hour before
  const endDate = new Date(targetDate);
  const startDate = new Date(targetDate.getTime() - 60 * 60 * 1000);

  return { startDate, endDate };
}

function getDefaultFutureDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 3); // 3 days from now
  d.setHours(17, 0, 0, 0);
  return d;
}

/**
 * Generate a direct, secure Google Calendar web creation URL.
 * Does not require OAuth or credentials; opens Google Calendar in browser with pre-populated fields.
 */
export function generateGoogleCalendarUrl(item: ActionItem, meetingTitle?: string): string {
  const { startDate, endDate } = getActionItemDates(item);
  const startStr = formatUtcForCalendar(startDate);
  const endStr = formatUtcForCalendar(endDate);

  const title = `[Due] ${item.title}`;
  const details = [
    `Task: ${item.title}`,
    `Assignee: ${item.assignee.name || 'Unassigned'}`,
    `Priority: ${item.priority.toUpperCase()}`,
    item.description ? `\nDetails:\n${item.description}` : '',
    item.citation?.quote ? `\nTranscript Quote: "${item.citation.quote}" (${item.citation.speaker || 'Speaker'})` : '',
    meetingTitle ? `\nFrom Meeting: ${meetingTitle}` : '',
    `\nGenerated securely by Synapse Meeting AI.`,
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details: details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate a Microsoft Outlook Web event URL
 */
export function generateOutlookCalendarUrl(item: ActionItem, meetingTitle?: string): string {
  const { startDate, endDate } = getActionItemDates(item);

  const title = `[Due] ${item.title}`;
  const body = [
    `Task: ${item.title}`,
    `Assignee: ${item.assignee.name || 'Unassigned'}`,
    `Priority: ${item.priority.toUpperCase()}`,
    item.description ? `<p>${item.description}</p>` : '',
    item.citation?.quote ? `<blockquote>"${item.citation.quote}" - ${item.citation.speaker || 'Speaker'}</blockquote>` : '',
    meetingTitle ? `<p><strong>Source Meeting:</strong> ${meetingTitle}</p>` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    subject: title,
    body: body,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    path: '/calendar/action/compose',
    rru: 'addevent',
  });

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Build standard RFC 5545 iCalendar (.ics) string for a single action item
 */
export function generateSingleActionItemIcs(item: ActionItem, meetingTitle?: string): string {
  const { startDate, endDate } = getActionItemDates(item);
  const uid = `synapse-${item.id}-${Date.now()}@synapse.ai`;
  const nowStr = formatUtcForCalendar(new Date());
  const startStr = formatUtcForCalendar(startDate);
  const endStr = formatUtcForCalendar(endDate);

  const summary = escapeIcsText(`[Due] ${item.title}`);
  const description = escapeIcsText(
    [
      `Task: ${item.title}`,
      `Assignee: ${item.assignee.name || 'Unassigned'}`,
      `Priority: ${item.priority.toUpperCase()}`,
      item.description ? `\nDetails: ${item.description}` : '',
      item.citation?.quote ? `\nTranscript Source: "${item.citation.quote}"` : '',
      meetingTitle ? `\nMeeting: ${meetingTitle}` : '',
    ]
      .filter(Boolean)
      .join('\n')
  );

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Synapse AI//Meeting Action Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `PRIORITY:${item.priority === 'urgent' ? 1 : item.priority === 'high' ? 3 : 5}`,
    `STATUS:CONFIRMED`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Task Due Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Build a bundled RFC 5545 iCalendar (.ics) file containing all action items and meeting follow-ups
 */
export function generateMeetingBundleIcs(analysis: MeetingAnalysis): string {
  const nowStr = formatUtcForCalendar(new Date());

  const events: string[] = [];

  // Add action item events
  analysis.actionItems.forEach((item, index) => {
    const { startDate, endDate } = getActionItemDates(item);
    const uid = `synapse-task-${analysis.id}-${item.id || index}-${Date.now()}@synapse.ai`;
    const startStr = formatUtcForCalendar(startDate);
    const endStr = formatUtcForCalendar(endDate);

    const summary = escapeIcsText(`[Task] ${item.title}`);
    const description = escapeIcsText(
      [
        `Task: ${item.title}`,
        `Assignee: ${item.assignee.name || 'Unassigned'}`,
        `Priority: ${item.priority.toUpperCase()}`,
        `Category: ${item.category}`,
        item.description ? `\nDetails: ${item.description}` : '',
        item.citation?.quote ? `\nVerified Quote: "${item.citation.quote}" (${item.citation.speaker || 'Speaker'})` : '',
        `\nMeeting: ${analysis.title} (${analysis.meetingDate})`,
      ]
        .filter(Boolean)
        .join('\n')
    );

    events.push(
      [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${nowStr}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `CATEGORIES:${escapeIcsText(item.category || 'Meeting Task')}`,
        `PRIORITY:${item.priority === 'urgent' ? 1 : item.priority === 'high' ? 3 : 5}`,
        `STATUS:CONFIRMED`,
        'BEGIN:VALARM',
        'TRIGGER:-PT24H',
        'ACTION:DISPLAY',
        'DESCRIPTION:Task Deadline Reminder',
        'END:VALARM',
        'END:VEVENT',
      ].join('\r\n')
    );
  });

  // Bundle into complete VCALENDAR
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Synapse AI//Meeting Action Engine//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcsText(analysis.title)} Tasks`,
    `X-WR-TIMEZONE:UTC`,
    ...events,
    'END:VCALENDAR',
  ].join('\r\n');
}

/**
 * Triggers browser download of .ics calendar file safely
 */
export function downloadIcsFile(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
