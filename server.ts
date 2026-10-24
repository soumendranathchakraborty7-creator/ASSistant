import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON with generous payload limit for base64 audio and screenshots
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google Gemini SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// System Persona: Calm, analytical, firm, stoic, disciplined, zero toxic positivity.
const STOIC_PERSONA_INSTRUCTION = `You are Asclepius Core, an elite, stoic medical residency coach and discipline strategist.
Your user is a dedicated medical student preparing for NEET PG, INI-CET, and University Professional exams while managing intense hospital clinical postings, physical endurance, and mental chastity.
Your tone is calm, analytical, firm, deeply disciplined, and completely free of toxic positivity, generic cheerleading, or fluffy advice.
You speak with the gravitas of a senior surgical consultant and Stoic philosopher (Marcus Aurelius / Epictetus).
When reviewing slips or fatigue, you diagnose root causes clinically and prescribe immediate, concrete physical and mental counter-actions.`;

// API: Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// API: Unified Gemini Endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { action, audioBase64, mimeType, imageBase64, imageType, slipContext, dailyAuditData, energyLevel } = req.body;

    const isSampleAudio = !audioBase64 || audioBase64.includes('SAMPLE');
    const isSampleImage = !imageBase64 || imageBase64.includes('SAMPLE');

    if (!ai || (isSampleAudio && (action === 'transcribe_audio' || action === 'transcribe_text')) || (isSampleImage && action === 'analyze_screenshot')) {
      // Deterministic intelligent fallback when GEMINI_API_KEY is pending or sample audio/image is selected
      if (action === 'transcribe_audio' || action === 'transcribe_text') {
        const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        const nextWeekStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        return res.json({
          success: true,
          fallback: true,
          parsedData: {
            energy_level: 75,
            available_hours: 5.5,
            weight: 74.4,
            mcqs_solved: [
              { code: 'MED-SURG-G1-M1', subject: 'Medicine', total: 40, correct: 34 }
            ],
            study_sessions: [
              { subject: 'Surgery (SRB Hernias Theory Block)', minutes: 90 },
              { subject: 'Anki Flashcards Spaced Review', minutes: 45 }
            ],
            workout: { ran: true, calisthenics: true, walk_km: 3.2 },
            urge_logged: { type: 'NONE', context: 'Deep focus maintained in casualty shift' },
            journal: {
              gratitude: 'Clean ECG interpretation during emergency ward rounds.',
              regrets: 'Delayed evening review by 15 minutes due to phone notification.',
              notable: 'Managed high-volume casualty shift smoothly.',
              tomorrow: 'Target Marrow Group 1 Custom Modules and Week 4 Running intervals.'
            },
            plans_to_add: [
              {
                title: 'Marrow Group 1 Custom Module (Med + Surg)',
                category: 'career',
                date: tomorrowStr,
                isDeadline: false,
                priority: 'HIGH',
                time: '16:00',
                notes: '2.5h solve & review window'
              },
              {
                title: 'University Clinical Case Logbook Final Submission',
                category: 'deadline',
                date: nextWeekStr,
                isDeadline: true,
                priority: 'HIGH',
                time: '12:00',
                notes: 'Must get HOD signature'
              }
            ]
          },
          summary: 'Residency voice review parsed: Logged 40 Med MCQs (85%), 2.25h study blocks, running session, and planned 2 calendar items.'
        });
      }

      if (action === 'analyze_screenshot') {
        const type = imageType || 'ANKI';
        if (type === 'ANKI') {
          return res.json({
            success: true,
            fallback: true,
            ocrData: {
              type: 'ANKI',
              cardsReviewed: 142,
              retentionRate: 88.5,
              timeMinutes: 48,
              streakDays: 24,
              flaggedReviewCount: 12
            },
            summary: 'Anki screenshot analyzed: 142 cards reviewed in 48 mins with 88.5% retention rate.'
          });
        }
        if (type === 'JOURNABLE') {
          return res.json({
            success: true,
            fallback: true,
            ocrData: {
              type: 'JOURNABLE',
              calories: 1940,
              proteinGrams: 135,
              proteinTargetGrams: 130,
              isLowProtein: false,
              mealsDetected: ['Eggs & Oats (35g P)', 'Chicken & Brown Rice (55g P)', 'Greek Yogurt & Whey (45g P)']
            },
            summary: 'Journable OCR parsed: 1940 kcal, 135g protein. Daily protein threshold achieved.'
          });
        }
        // SCREENZEN
        return res.json({
          success: true,
          fallback: true,
          ocrData: {
            type: 'SCREENZEN',
            youtubeMinutes: 24,
            totalScreenTimeMinutes: 110,
            isOverLimit: false,
            topApps: ['Anki (52m)', 'Marrow (34m)', 'YouTube (24m)']
          },
          summary: 'ScreenZen screenshot parsed: YouTube 24 min (under 30 min cap). Total phone screen 1h 50m.'
        });
      }

      if (action === 'generate_redemption') {
        const penalty = slipContext?.type === 'SEXUAL_URGE' ? -500 : -300;
        return res.json({
          success: true,
          fallback: true,
          redemption: {
            tacticalAction: 'Immediate Counter-Action: Drop to the floor for 25 controlled pushups and 30 deep squats. Splash cold water on your face. Clean your entire study desk of all non-clinical objects. Open your lowest-scoring subject ledger and complete a 45-minute continuous, phone-locked study block.',
            xpRedeemable: Math.abs(penalty),
            stoicMessage: 'A slip is a breach of discipline, not an excuse for surrender. The pain of discipline is measured in ounces; the pain of regret in tons. Execute the protocol immediately.'
          }
        });
      }

      // Default coaching fallback
      return res.json({
        success: true,
        fallback: true,
        coaching: {
          assessment: 'Capacity is stable. Maintain fidelity to the subject cluster and protect your sleep window against on-call disruptions.',
          priorityAdvice: 'Do not negotiate with your schedule. Complete the 11-week running protocol intervals without bargaining.',
          missedAudit: 'Ensure all 4th-year mistake cards are audited before the 7-day staleness threshold.'
        }
      });
    }

    // REAL GEMINI CALLS
    if (action === 'transcribe_audio' || action === 'transcribe_text') {
      const parts: any[] = [];
      if (action === 'transcribe_audio') {
        if (!audioBase64) {
          return res.status(400).json({ error: 'audioBase64 is required' });
        }
        parts.push({
          inlineData: {
            mimeType: mimeType || 'audio/webm',
            data: audioBase64,
          },
        });
      }

      const userText = req.body.text || '';
      parts.push({
        text: `${userText ? `User dictated text: "${userText}"\n\n` : ''}Extract all structured medical student daily metrics and any planned events, to-dos, deadlines, or schedule changes mentioned from this input according to the JSON schema.
If an item is not mentioned, leave null or empty list.
Format as JSON matching:
{
  "energy_level": number (0-100),
  "available_hours": number,
  "weight": number or null,
  "mcqs_solved": [{"code": string, "subject": string, "total": number, "correct": number}],
  "study_sessions": [{"subject": string, "minutes": number}],
  "workout": {"ran": boolean, "calisthenics": boolean, "walk_km": number},
  "urge_logged": {"type": string, "context": string},
  "journal": {"gratitude": string, "regrets": string, "notable": string, "tomorrow": string},
  "plans_to_add": [
    {
      "title": string,
      "category": "deadline" | "todo" | "career" | "fitness" | "discipline" | "social" | "recreation",
      "date": "YYYY-MM-DD",
      "isDeadline": boolean,
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "time": string,
      "notes": string
    }
  ]
}`,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction: STOIC_PERSONA_INSTRUCTION,
          responseMimeType: 'application/json',
        },
      });

      const parsedData = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        parsedData,
        summary: `Voice/dictation review transcribed and parsed into daily metrics and calendar plans.`,
      });
    }

    if (action === 'analyze_screenshot') {
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const promptText = `Analyze this medical student productivity / fitness screenshot.
Determine if it is from Anki (flashcard statistics), Journable (nutrition / calories / protein), or ScreenZen (digital wellbeing / screen time / YouTube).
Extract the exact data into JSON:
For Anki: { "type": "ANKI", "cardsReviewed": number, "retentionRate": number, "timeMinutes": number, "streakDays": number, "flaggedReviewCount": number }
For Journable: { "type": "JOURNABLE", "calories": number, "proteinGrams": number, "proteinTargetGrams": 130, "isLowProtein": boolean, "mealsDetected": [string] }
For ScreenZen: { "type": "SCREENZEN", "youtubeMinutes": number, "totalScreenTimeMinutes": number, "isOverLimit": boolean, "topApps": [string] }
Include a brief 1-sentence stoic summary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'image/png',
                  data: imageBase64,
                },
              },
              { text: promptText },
            ],
          },
        ],
        config: {
          systemInstruction: STOIC_PERSONA_INSTRUCTION,
          responseMimeType: 'application/json',
        },
      });

      const ocrData = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        ocrData,
        summary: `Screenshot analyzed accurately.`,
      });
    }

    if (action === 'generate_redemption') {
      const type = slipContext?.type || 'DOOMSCROLLING';
      const penalty = type === 'MASTURBATION' ? -500 : -300;

      const prompt = `The user suffered a disciplinary slip: ${type}.
Context: ${slipContext?.context || 'Unspecified breach of discipline'}.
Current Energy Level: ${energyLevel || 70}%.
Generate a strict, uncompromising, actionable Stoic Redemption Protocol.
Must prescribe:
1. An immediate physical shock counter-action (e.g. cold water, pushups/squats).
2. An environmental reset (clear desk, phone into another room).
3. A focused deep-work block (e.g. 45-60 min review of difficult MCQ mistakes).
Keep it under 100 words, direct, and authoritative. Return JSON:
{
  "tacticalAction": "string",
  "xpRedeemable": ${Math.abs(penalty)},
  "stoicMessage": "string"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: STOIC_PERSONA_INSTRUCTION,
          responseMimeType: 'application/json',
        },
      });

      const redemption = JSON.parse(response.text || '{}');
      return res.json({
        success: true,
        redemption,
      });
    }

    // Adaptive daily coaching
    const auditPrompt = `Review this daily performance snapshot for a medical student preparing for NEET PG / University Profs:
${JSON.stringify(dailyAuditData || {})}
Evaluate adherence to study blocks, running protocol, and discipline.
Return JSON:
{
  "assessment": "concise 2-sentence clinical review",
  "priorityAdvice": "1 direct tactical adjustment for tomorrow",
  "missedAudit": "any critical stale subjects or unreviewed mistakes flagged"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: auditPrompt,
      config: {
        systemInstruction: STOIC_PERSONA_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const coaching = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      coaching,
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process Gemini multimodal request',
    });
  }
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Asclepius OS Server running on http://localhost:${PORT}`);
  });
}

startServer();
