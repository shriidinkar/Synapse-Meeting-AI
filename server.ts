import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side initialization of Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', hasApiKey: !!apiKey });
});

/**
 * Main Analysis Endpoint: Converts meeting transcript into verified, structured data
 */
app.post('/api/analyze-transcript', async (req: Request, res: Response) => {
  try {
    const { transcript, meetingDate, meetingTitle } = req.body;

    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript content is required.' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.',
      });
    }

    const referenceDate = meetingDate || new Date().toISOString().split('T')[0];

    const systemPrompt = `You are Synapse, an autonomous executive meeting intelligence engine.
Your mission is to parse raw meeting transcripts into 100% grounded, verifiable structured meeting records.

STRICT ZERO-HALLUCINATION DIRECTIVES:
1. GROUNDEDNESS MANDATE: Every single extracted decision, action item, key topic, and follow-up MUST include the exact verbatim quote ('quote') from the transcript, the speaker's name, and the timestamp if present. Never fabricate quotes.
2. AMBIGUITY & INCOMPLETION DETECTION:
   - Identify any action item or task that is incomplete or ambiguous.
   - If an owner is missing, vague (e.g. "someone should", "we need to", "team will"), set 'assignee.isAmbiguous': true, 'ambiguity.isAmbiguous': true, 'ambiguity.type': 'missing_owner', and formulate a clear clarification question with 2-3 realistic suggested resolutions.
   - If a deadline is fuzzy (e.g. "soon", "next week", "ASAP", "before launch"), set 'deadline.isAmbiguous': true, 'ambiguity.isAmbiguous': true, 'ambiguity.type': 'vague_deadline', and suggest concrete dates based on the meeting date (${referenceDate}).
   - If scope or deliverables are unclear (e.g. "look into it"), set 'ambiguity.type': 'underspecified_scope'.
   - If statements contradict each other, set 'ambiguity.type': 'conflicting_statements'.
3. DEADLINE NORMALIZATION:
   - Convert relative dates (e.g. "by Friday, Nov 13", "next Tuesday") into standard ISO 8601 timestamps ('YYYY-MM-DDTHH:mm:ss') using the reference meeting date: ${referenceDate}.
   - If the exact time is not specified, default the ISO deadline to 17:00:00 (5:00 PM).
4. DECISIONS LOG:
   - Extract only explicit commitments and locked-in decisions agreed upon in the meeting. Include the rationale and impact area.
5. PARTICIPANTS:
   - List all participants identified in the transcript with their speaker labels and counts.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          text: `Please analyze the following meeting transcript.
Reference Meeting Date: ${referenceDate}
Suggested Title: ${meetingTitle || 'Meeting'}

TRANSCRIPT:
${transcript}`,
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Descriptive title for the meeting' },
            meetingDate: { type: Type.STRING, description: 'Meeting date in YYYY-MM-DD format' },
            durationEstimated: { type: Type.STRING, description: 'Estimated duration e.g. 45 mins' },
            executiveSummary: { type: Type.STRING, description: 'Concise executive summary of 2-3 paragraphs' },
            sentiment: {
              type: Type.STRING,
              description: 'Overall meeting tone: constructive | aligned | debated | urgent',
            },
            participants: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  speakerLabel: { type: Type.STRING },
                  actionsAssignedCount: { type: Type.INTEGER },
                  decisionsInvolvedCount: { type: Type.INTEGER },
                },
                required: ['name', 'actionsAssignedCount', 'decisionsInvolvedCount'],
              },
            },
            decisions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  decidedBy: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  impactArea: { type: Type.STRING },
                  citation: {
                    type: Type.OBJECT,
                    properties: {
                      quote: { type: Type.STRING },
                      speaker: { type: Type.STRING },
                      timestamp: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                    },
                    required: ['quote', 'speaker', 'confidence'],
                  },
                },
                required: ['id', 'title', 'description', 'decidedBy', 'rationale', 'impactArea', 'citation'],
              },
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  assignee: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      isAmbiguous: { type: Type.BOOLEAN },
                    },
                    required: ['name', 'isAmbiguous'],
                  },
                  deadline: {
                    type: Type.OBJECT,
                    properties: {
                      raw: { type: Type.STRING },
                      isoDate: { type: Type.STRING },
                      isAmbiguous: { type: Type.BOOLEAN },
                    },
                    required: ['raw', 'isAmbiguous'],
                  },
                  priority: { type: Type.STRING, description: 'urgent | high | medium | low' },
                  category: { type: Type.STRING },
                  status: { type: Type.STRING, description: 'pending | in_progress | completed' },
                  ambiguity: {
                    type: Type.OBJECT,
                    properties: {
                      isAmbiguous: { type: Type.BOOLEAN },
                      type: { type: Type.STRING, description: 'missing_owner | vague_deadline | underspecified_scope | conflicting_statements | missing_dependency' },
                      explanation: { type: Type.STRING },
                      clarificationQuestion: { type: Type.STRING },
                      suggestedResolutions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                    required: ['isAmbiguous'],
                  },
                  citation: {
                    type: Type.OBJECT,
                    properties: {
                      quote: { type: Type.STRING },
                      speaker: { type: Type.STRING },
                      timestamp: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                    },
                    required: ['quote', 'speaker', 'confidence'],
                  },
                },
                required: ['id', 'title', 'description', 'assignee', 'deadline', 'priority', 'category', 'status', 'ambiguity', 'citation'],
              },
            },
            keyTopics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  speakers: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['topic', 'summary', 'speakers'],
              },
            },
            followUps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, description: 'next_meeting | external_communication | open_question | approval_needed' },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  suggestedTimeline: { type: Type.STRING },
                  suggestedParticipants: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['id', 'type', 'title', 'description'],
              },
            },
          },
          required: [
            'title',
            'meetingDate',
            'executiveSummary',
            'sentiment',
            'participants',
            'decisions',
            'actionItems',
            'keyTopics',
            'followUps',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Received empty response from Gemini model.');
    }

    const parsed = JSON.parse(text);

    // Enrich with raw transcript and creation timestamp
    const fullAnalysis = {
      ...parsed,
      id: `mtg-${Date.now()}`,
      rawTranscript: transcript,
      createdAt: new Date().toISOString(),
    };

    return res.json(fullAnalysis);
  } catch (error: any) {
    console.error('Error in /api/analyze-transcript:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to analyze meeting transcript.',
    });
  }
});

/**
 * Interactive Clarification Endpoint: Resolves an ambiguous action item
 */
app.post('/api/resolve-ambiguity', async (req: Request, res: Response) => {
  try {
    const { actionItem, userResolution, meetingDate } = req.body;

    if (!actionItem || !userResolution) {
      return res.status(400).json({ error: 'Action item and resolution are required.' });
    }

    const referenceDate = meetingDate || new Date().toISOString().split('T')[0];

    const prompt = `You are updating a meeting action item based on user clarification.
Original Action Item:
${JSON.stringify(actionItem, null, 2)}

User's Clarification / Answer:
"${userResolution}"

Reference Date: ${referenceDate}

TASK:
1. Update the action item fields (assignee, deadline, description, priority, category) based on the user's clarification.
2. If the user specified an owner, update 'assignee.name' and set 'assignee.isAmbiguous' to false.
3. If the user clarified the deadline, update 'deadline.raw', calculate the normalized 'deadline.isoDate' (e.g. YYYY-MM-DDTHH:mm:ss), and set 'deadline.isAmbiguous' to false.
4. Mark 'ambiguity.isAmbiguous' to false, record 'ambiguity.resolvedValue' with a concise summary of what was resolved, and timestamp 'ambiguity.resolvedAt'.
5. Return the updated ActionItem JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: prompt }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) throw new Error('Empty response from model');

    const updatedItem = JSON.parse(text);
    return res.json(updatedItem);
  } catch (error: any) {
    console.error('Error in /api/resolve-ambiguity:', error);
    return res.status(500).json({
      error: error?.message || 'Failed to resolve action item ambiguity.',
    });
  }
});

/**
 * Generate Clarification Email / Message draft to send to participants
 */
app.post('/api/generate-clarification-draft', async (req: Request, res: Response) => {
  try {
    const { actionItem, meetingTitle } = req.body;

    const prompt = `Write a short, friendly, and ultra-clear email or Slack message asking for clarification on an incomplete action item from the meeting "${meetingTitle || 'our recent meeting'}".

Action Item: ${actionItem.title}
Detected Ambiguity: ${actionItem.ambiguity?.explanation || 'Missing details'}
Transcript Quote: "${actionItem.citation?.quote || ''}" (${actionItem.citation?.speaker || 'Participant'})
Clarification Needed: ${actionItem.ambiguity?.clarificationQuestion || 'Owner or deadline needed'}

Draft a 2-4 sentence message with a clear call-to-action that anyone can copy-paste to Slack or Email.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ text: prompt }],
    });

    return res.json({ draft: response.text || '' });
  } catch (error: any) {
    console.error('Error generating draft:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate draft.' });
  }
});

/**
 * Production static serving or Dev Vite middleware
 */
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Synapse Meeting AI server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
