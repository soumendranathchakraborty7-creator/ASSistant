import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

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

const STOIC_PERSONA_INSTRUCTION = `You are Asclepius Core, an elite, stoic medical residency coach and discipline strategist.
Your user is a dedicated medical student preparing for NEET PG, INI-CET, and University Professional exams while managing intense hospital clinical postings, physical endurance, and mental chastity.
Your tone is calm, analytical, firm, deeply disciplined, and completely free of toxic positivity or generic cheerleading.
When reviewing slips or fatigue, you diagnose root causes clinically and prescribe immediate, concrete physical and mental counter-actions.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, audioBase64, mimeType, imageBase64, imageType, slipContext, dailyAuditData, energyLevel } = body;

    if (!ai) {
      if (action === 'transcribe_audio') {
        return NextResponse.json({
          success: true,
          fallback: true,
          parsedData: {
            energy_level: 70,
            available_hours: 5.5,
            weight: 74.8,
            mcqs_solved: [{ code: 'MED-CARDIO-02', subject: 'Medicine', total: 50, correct: 41 }],
            study_sessions: [{ subject: 'Surgery (SRB Hernias)', minutes: 90 }],
            workout: { ran: true, calisthenics: true, walk_km: 3.2 },
            urge_logged: { type: 'NONE', context: 'Deep focus maintained in casualty' },
            journal: { gratitude: 'Clean rounds', regrets: 'None', notable: 'Intubated smoothly', tomorrow: 'Cluster B' }
          },
          summary: 'Voice note transcribed (Deterministic Fallback).'
        });
      }
      return NextResponse.json({ success: true, fallback: true, summary: 'AI Studio service ready.' });
    }

    if (action === 'transcribe_audio') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: mimeType || 'audio/webm', data: audioBase64 } },
              {
                text: `Extract structured medical student daily metrics from this voice note:
{
  "energy_level": number (0-100),
  "available_hours": number,
  "weight": number or null,
  "mcqs_solved": [{"code": string, "subject": string, "total": number, "correct": number}],
  "study_sessions": [{"subject": string, "minutes": number}],
  "workout": {"ran": boolean, "calisthenics": boolean, "walk_km": number},
  "urge_logged": {"type": string, "context": string},
  "journal": {"gratitude": string, "regrets": string, "notable": string, "tomorrow": string}
}`
              }
            ]
          }
        ],
        config: { systemInstruction: STOIC_PERSONA_INSTRUCTION, responseMimeType: 'application/json' }
      });

      return NextResponse.json({ success: true, parsedData: JSON.parse(response.text || '{}') });
    }

    if (action === 'analyze_screenshot') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: mimeType || 'image/png', data: imageBase64 } },
              {
                text: `Analyze this screenshot (Anki, Journable, or ScreenZen) and return structured JSON metrics.`
              }
            ]
          }
        ],
        config: { systemInstruction: STOIC_PERSONA_INSTRUCTION, responseMimeType: 'application/json' }
      });
      return NextResponse.json({ success: true, ocrData: JSON.parse(response.text || '{}') });
    }

    if (action === 'generate_redemption') {
      const type = slipContext?.type || 'DOOMSCROLLING';
      const penalty = type === 'MASTURBATION' ? -500 : -300;
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Disciplinary slip: ${type}. Prescribe immediate cold-water, pushup/squat, room reset, and deep study protocol. Return JSON { "tacticalAction": "string", "xpRedeemable": ${Math.abs(penalty)}, "stoicMessage": "string" }`,
        config: { systemInstruction: STOIC_PERSONA_INSTRUCTION, responseMimeType: 'application/json' }
      });
      return NextResponse.json({ success: true, redemption: JSON.parse(response.text || '{}') });
    }

    return NextResponse.json({ success: true, message: 'Asclepius Gemini handler ready.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
