export interface ExtractedPlanItem {
  title: string;
  category: 'deadline' | 'todo' | 'career' | 'fitness' | 'discipline' | 'social' | 'recreation';
  date?: string;
  isDeadline?: boolean;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  time?: string;
  notes?: string;
}

export interface AudioTranscriptionResult {
  energy_level?: number;
  available_hours?: number;
  weight?: number | null;
  weighIn?: { weightKg: number };
  mcqs_solved?: { code: string; subject: string; total: number; correct: number }[];
  marrow?: { moduleCode?: string; subject?: string; totalQuestions?: number; correctCount?: number; notes?: string };
  study_sessions?: { subject: string; minutes: number }[];
  workout?: { ran: boolean; calisthenics: boolean; walk_km: number };
  urge_logged?: { type: string; context: string };
  urge?: { intensity?: number; wasSlip?: boolean; context?: string };
  journal?: { gratitude: string; regrets: string; notable: string; tomorrow: string };
  plans_to_add?: ExtractedPlanItem[];
}

export interface ScreenshotOCRResult {
  type: 'ANKI' | 'JOURNABLE' | 'SCREENZEN';
  cardsReviewed?: number;
  retentionRate?: number;
  timeMinutes?: number;
  streakDays?: number;
  calories?: number;
  proteinGrams?: number;
  proteinTargetGrams?: number;
  isLowProtein?: boolean;
  mealsDetected?: string[];
  youtubeMinutes?: number;
  totalScreenTimeMinutes?: number;
  isOverLimit?: boolean;
}

export interface RedemptionResult {
  tacticalAction: string;
  xpRedeemable: number;
  stoicMessage: string;
}

export interface CoachingResult {
  assessment: string;
  priorityAdvice: string;
  missedAudit: string;
}

export const geminiService = {
  async transcribeAudio(audioBase64: string, mimeType: string = 'audio/webm'): Promise<{
    parsedData: AudioTranscriptionResult;
    summary: string;
  }> {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'transcribe_audio',
        audioBase64,
        mimeType
      })
    });

    if (!response.ok) {
      throw new Error(`Voice transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      parsedData: data.parsedData || {},
      summary: data.summary || 'Voice log processed successfully.'
    };
  },

  async transcribeText(text: string): Promise<{
    parsedData: AudioTranscriptionResult;
    summary: string;
  }> {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'transcribe_text',
        text
      })
    });

    if (!response.ok) {
      throw new Error(`Text analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      parsedData: data.parsedData || {},
      summary: data.summary || 'Review text processed successfully.'
    };
  },

  async analyzeScreenshot(
    imageBase64: string,
    imageType: 'ANKI' | 'JOURNABLE' | 'SCREENZEN',
    mimeType: string = 'image/png'
  ): Promise<{
    ocrData: ScreenshotOCRResult;
    summary: string;
  }> {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'analyze_screenshot',
        imageBase64,
        imageType,
        mimeType
      })
    });

    if (!response.ok) {
      throw new Error(`Screenshot analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      ocrData: data.ocrData || {},
      summary: data.summary || 'Screenshot analyzed successfully.'
    };
  },

  async generateRedemption(
    slipContext: { type: string; context: string },
    energyLevel: number = 70
  ): Promise<RedemptionResult> {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_redemption',
        slipContext,
        energyLevel
      })
    });

    if (!response.ok) {
      throw new Error(`Redemption protocol generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return (
      data.redemption || {
        tacticalAction: 'Drop for 25 pushups and execute a 45-minute continuous study block.',
        xpRedeemable: 300,
        stoicMessage: 'Acknowledge the breach. Re-anchor to purpose immediately.'
      }
    );
  },

  async getDailyCoaching(dailyAuditData: any): Promise<CoachingResult> {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'daily_coaching',
        dailyAuditData
      })
    });

    if (!response.ok) {
      throw new Error(`Coaching request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return (
      data.coaching || {
        assessment: 'Schedule execution steady.',
        priorityAdvice: 'Protect your sleep window before casualty duty.',
        missedAudit: 'Ensure all 4th year subjects have entries within 7 days.'
      }
    );
  }
};
