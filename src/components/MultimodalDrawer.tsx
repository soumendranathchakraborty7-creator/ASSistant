import React, { useState, useRef } from 'react';
import {
  Mic,
  MicOff,
  Image as ImageIcon,
  Sparkles,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { geminiService, AudioTranscriptionResult, ScreenshotOCRResult } from '../services/geminiService.ts';

interface MultimodalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoiceData: (data: AudioTranscriptionResult) => void;
  onApplyOCRData: (data: ScreenshotOCRResult) => void;
}

export const MultimodalDrawer: React.FC<MultimodalDrawerProps> = ({
  isOpen,
  onClose,
  onApplyVoiceData,
  onApplyOCRData
}) => {
  const [activeTab, setActiveTab] = useState<'VOICE' | 'SCREENSHOT'>('VOICE');

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [dictationText, setDictationText] = useState('');
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Screenshot upload state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [screenshotType, setScreenshotType] = useState<'ANKI' | 'JOURNABLE' | 'SCREENZEN'>('ANKI');

  // Analysis result state
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceResult, setVoiceResult] = useState<AudioTranscriptionResult | null>(null);
  const [ocrResult, setOcrResult] = useState<ScreenshotOCRResult | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Start Mic Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setVoiceResult(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const pureBase64 = base64data.split(',')[1];
          setRecordedBase64(pureBase64);
        };

        // Stop media stream tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone permission denied or unavailable, providing sample audio option:', err);
      setErrorMessage('Microphone access unavailable. You can type dictation text directly or use the Preset note below.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  // Preset Voice Note Sample for fast testing
  const loadPresetVoiceNote = () => {
    setErrorMessage(null);
    const sampleText = 'Casualty shift finished, energy 75%, 5.5h study available. Solved 40 Surgery MCQs (34 correct). Ran Week 4 intervals. Plan: Marrow Group 1 Custom Module on Friday 4pm, Deadline: University Logbook Submission next Wednesday.';
    setDictationText(sampleText);
    setRecordedBase64('PRESET_AUDIO_BASE64_SAMPLE');
    setRecordedAudioUrl(null);
    setRecordingSeconds(38);
    setSummaryMessage('Loaded sample clinical log note: "Casualty shift finished, solved 40 Surgery MCQs, Week 4 run, plan Marrow Group 1 on Friday, Deadline next Wednesday"');
  };

  // Handle Process Voice Note
  const handleProcessVoice = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      let res;
      if (dictationText.trim() && !recordedAudioUrl) {
        res = await geminiService.transcribeText(dictationText);
      } else {
        res = await geminiService.transcribeAudio(recordedBase64 || 'PRESET_SAMPLE');
      }
      setVoiceResult(res.parsedData);
      setSummaryMessage(res.summary);
    } catch (err: any) {
      setErrorMessage(err.message || 'Voice transcription failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Image File Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setOcrResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      const pureBase64 = result.split(',')[1];
      setImageBase64(pureBase64);
    };
    reader.readAsDataURL(file);
  };

  // Load Preset Screenshot Sample for testing
  const loadPresetScreenshot = (type: 'ANKI' | 'JOURNABLE' | 'SCREENZEN') => {
    setScreenshotType(type);
    setImageBase64('PRESET_IMAGE_SAMPLE');
    setImagePreview(null);
    setErrorMessage(null);
    setSummaryMessage(`Loaded preset ${type} screenshot sample for instant OCR testing.`);
  };

  // Handle Process Screenshot
  const handleProcessScreenshot = async () => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const res = await geminiService.analyzeScreenshot(
        imageBase64 || 'PRESET_SAMPLE',
        screenshotType
      );
      setOcrResult(res.ocrData);
      setSummaryMessage(res.summary);
    } catch (err: any) {
      setErrorMessage(err.message || 'Screenshot OCR failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-[#090D14] border border-neutral-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-sans">
                Gemini 2.5 Flash Multimodal Hub
              </h3>
              <p className="text-xs text-neutral-400">
                Voice transcription parsing & screenshot OCR analysis
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-800/80 my-4 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('VOICE');
              setErrorMessage(null);
              setSummaryMessage(null);
            }}
            className={`flex-1 py-2 text-center transition border-b-2 cursor-pointer ${
              activeTab === 'VOICE'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Voice Note Log
          </button>
          <button
            onClick={() => {
              setActiveTab('SCREENSHOT');
              setErrorMessage(null);
              setSummaryMessage(null);
            }}
            className={`flex-1 py-2 text-center transition border-b-2 cursor-pointer ${
              activeTab === 'SCREENSHOT'
                ? 'border-sky-500 text-sky-400 font-bold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Screenshot OCR (Anki / Journable / ScreenZen)
          </button>
        </div>

        {/* ERROR / SUMMARY BANNERS */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {summaryMessage && (
          <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{summaryMessage}</span>
          </div>
        )}

        {/* TAB 1: VOICE TRANSCRIPTION & REVIEW LOG */}
        {activeTab === 'VOICE' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Dictate your day: energy level, clinical hours, MCQs, intervals, reflections, or upcoming deadlines &amp; planned tasks. Gemini automatically extracts metrics and plans events directly into your Calendar &amp; Daily Schedule.
            </p>

            {/* Mic Action Area */}
            <div className="p-5 bg-neutral-950 border border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-center">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition shadow-lg cursor-pointer ${
                  isRecording
                    ? 'bg-rose-600 animate-pulse text-white'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>

              <span className="text-xs font-mono font-bold text-white mt-3">
                {isRecording
                  ? `Recording... ${recordingSeconds}s (Speak now)`
                  : recordedBase64
                  ? `Audio Captured (${recordingSeconds}s)`
                  : 'Tap Mic to Dictate Voice Review'}
              </span>

              {recordedAudioUrl && (
                <audio src={recordedAudioUrl} controls className="w-full mt-3 h-8" />
              )}
            </div>

            {/* Or Dictate via Quick Text / Edit Speech Box */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                <span>Or Type / Edit Dictation Note:</span>
                <span className="text-sky-400 font-sans cursor-pointer hover:underline" onClick={loadPresetVoiceNote}>
                  Load Preset Note
                </span>
              </label>
              <textarea
                value={dictationText}
                onChange={(e) => setDictationText(e.target.value)}
                placeholder="e.g. Energy 80%, 5 hours available. Solved 40 Surgery MCQs (34 correct). Ran Week 4 intervals. Plan: Marrow Group 1 on Friday, Deadline: Logbook submission next Tuesday."
                rows={3}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={loadPresetVoiceNote}
                className="text-neutral-400 hover:text-sky-300 underline font-mono cursor-pointer"
              >
                Sample Clinical Log
              </button>

              <button
                type="button"
                disabled={(!recordedBase64 && !dictationText.trim()) || isProcessing}
                onClick={handleProcessVoice}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-semibold transition cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isProcessing ? 'Parsing via Gemini Flash...' : 'Extract & Plan Into Calendar'}
              </button>
            </div>

            {/* Structured Parsed Data Preview */}
            {voiceResult && (
              <div className="p-4 bg-neutral-950 border border-emerald-500/40 rounded-xl space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider block">
                    Structured Review Extracted:
                  </span>
                  {voiceResult.plans_to_add && voiceResult.plans_to_add.length > 0 && (
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                      +{voiceResult.plans_to_add.length} Calendar Item(s)
                    </span>
                  )}
                </div>

                {voiceResult.plans_to_add && voiceResult.plans_to_add.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-500/30 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-sky-400 block">
                      Calendar &amp; Planner Integrations Detected:
                    </span>
                    {voiceResult.plans_to_add.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-neutral-200">
                        <span>• {p.title} ({p.category})</span>
                        <span className="text-neutral-400 text-[10px]">{p.date || 'Today'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <pre className="text-neutral-300 overflow-x-auto text-[11px] bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800">
                  {JSON.stringify(voiceResult, null, 2)}
                </pre>

                <button
                  onClick={() => {
                    onApplyVoiceData(voiceResult);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer mt-2"
                >
                  Apply All Metrics &amp; Auto-Plan in Calendar
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SCREENSHOT OCR */}
        {activeTab === 'SCREENSHOT' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-300 leading-relaxed font-sans">
              Upload screenshots from <strong className="text-sky-400">Anki</strong> (cards reviewed), <strong className="text-emerald-400">Journable</strong> (calories & protein), or <strong className="text-rose-400">ScreenZen</strong> (YouTube usage).
            </p>

            <div className="flex gap-2">
              {(['ANKI', 'JOURNABLE', 'SCREENZEN'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setScreenshotType(t)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                    screenshotType === t
                      ? 'bg-sky-950 border-sky-500 text-sky-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* File Upload Box */}
            <label className="p-6 bg-neutral-950 border border-dashed border-neutral-700 hover:border-sky-500 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition">
              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
              <span className="text-xs font-bold text-white">
                Choose Screenshot Image
              </span>
              <span className="text-[11px] text-neutral-400 mt-0.5">
                PNG, JPG or WebP
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </label>

            {imagePreview && (
              <div className="relative rounded-xl overflow-hidden max-h-48 border border-neutral-800">
                <img
                  src={imagePreview}
                  alt="Screenshot Preview"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => loadPresetScreenshot(screenshotType)}
                className="text-neutral-400 hover:text-sky-300 underline font-mono cursor-pointer"
              >
                Use Sample {screenshotType} Screenshot
              </button>

              <button
                type="button"
                disabled={!imageBase64 || isProcessing}
                onClick={handleProcessScreenshot}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-semibold transition cursor-pointer shadow-sm"
              >
                {isProcessing ? 'Analyzing Image...' : 'Run Multimodal OCR'}
              </button>
            </div>

            {/* OCR Data Preview */}
            {ocrResult && (
              <div className="p-4 bg-neutral-950 border border-emerald-500/40 rounded-xl space-y-2 text-xs font-mono">
                <span className="font-bold text-emerald-400 uppercase tracking-wider block">
                  OCR Data Extracted ({ocrResult.type}):
                </span>
                <pre className="text-neutral-300 overflow-x-auto text-[11px] bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800">
                  {JSON.stringify(ocrResult, null, 2)}
                </pre>

                <button
                  onClick={() => {
                    onApplyOCRData(ocrResult);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer mt-2"
                >
                  Apply OCR Metrics to System State
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
