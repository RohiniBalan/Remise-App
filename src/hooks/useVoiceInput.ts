import { useCallback, useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Voice, { SpeechErrorEvent, SpeechResultsEvent } from '@dev-amirzubair/react-native-voice';

// Shared native speech-to-text hook (wraps @dev-amirzubair/react-native-voice
// — see the plan file / this repo's memory for why this specific fork was
// chosen: the original @react-native-voice/voice is archived and has no New
// Architecture support, this fork fixes that), used by both the Store Owner
// voice product-entry flow (StoreProductFormScreen) and the Customer
// voice-ordering flow (BulkPurchaseScreen) so neither duplicates the
// Voice.start/stop/listener wiring.
//
// Deliberately does NOT translate — it only converts speech to text in
// whichever language was selected. The resulting (possibly non-English)
// transcript is sent to `geminiScanApi.ts`'s `parseVoiceProduct`/
// `parseVoiceList`, which ask Gemini to translate-then-extract in one text
// call (mobile can't reach the IndicTrans2 service web uses — see that
// file's comments), mirroring how every other mobile AI-scan flow already
// calls Gemini directly instead of a backend route.

export interface VoiceLanguageOption {
  code: string;   // BCP-47 locale passed to Voice.start()
  short: string;  // ISO 639-1 code sent to geminiScanApi as sourceLang
  label: string;
}

export const VOICE_LANGUAGES: VoiceLanguageOption[] = [
  { code: 'en-IN', short: 'en', label: 'English' },
  { code: 'ta-IN', short: 'ta', label: 'Tamil' },
  { code: 'te-IN', short: 'te', label: 'Telugu' },
  { code: 'kn-IN', short: 'kn', label: 'Kannada' },
  { code: 'ml-IN', short: 'ml', label: 'Malayalam' },
];

async function requestMicPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

interface UseVoiceInputResult {
  listening: boolean;
  transcript: string;
  partialTranscript: string;
  error: string;
  start: (lang: VoiceLanguageOption) => void;
  stop: () => void;
}

export function useVoiceInput(onFinalResult?: (transcript: string) => void): UseVoiceInputResult {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [partialTranscript, setPartialTranscript] = useState('');
  const [error, setError] = useState('');
  const onFinalResultRef = useRef(onFinalResult);
  onFinalResultRef.current = onFinalResult;
  // Tracks the latest text seen from EITHER partial or final results — used
  // as a fallback below, since some Android recognizers never fire a final
  // onSpeechResults event when the user manually taps Stop (only natural
  // silence detection triggers it), leaving `transcript` empty even though
  // the partial results clearly captured real speech the whole time.
  const latestTextRef = useRef('');

  useEffect(() => {
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      const text = (e.value?.[0] || '').trim();
      latestTextRef.current = text;
      setTranscript(text);
      setPartialTranscript('');
    };
    Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
      const text = (e.value?.[0] || '').trim();
      latestTextRef.current = text;
      setPartialTranscript(text);
    };
    Voice.onSpeechError = (e: SpeechErrorEvent) => {
      setError(e.error?.message || 'Voice input error.');
      setListening(false);
      Voice.cancel().catch(() => {});
    };
    Voice.onSpeechEnd = () => {
      setListening(false);
      setPartialTranscript('');
      // No final result arrived — fall back to whatever the last partial
      // result captured, so a manual Stop tap doesn't lose the transcript.
      setTranscript(prev => prev.trim() ? prev : latestTextRef.current);
    };

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners()).catch(() => {});
    };
  }, []);

  // Fire the callback once transcription genuinely finishes (listening
  // turned back off with a non-empty transcript) rather than on every
  // keystroke-like partial update.
  useEffect(() => {
    if (!listening && transcript.trim()) {
      onFinalResultRef.current?.(transcript.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]);

  const start = useCallback(async (lang: VoiceLanguageOption) => {
  setError('');
  setTranscript('');
  setPartialTranscript('');
  latestTextRef.current = '';
    const granted = await requestMicPermission();
    if (!granted) {
      setError('Microphone access was denied.');
      return;
    }
    try {
      setListening(true);
      // Force Google's cloud speech-recognition engine instead of letting
      // the OS pick whatever recognizer is set as system default. Web's
      // multilingual support "just works" because Chrome/Edge's Web Speech
      // API always talks to Google's server-side recognizer, which honors
      // `recognition.lang` for every code in VOICE_LANGUAGES. On Android,
      // `SpeechRecognizer.createSpeechRecognizer()` (no engine specified)
      // can bind to an on-device recognizer that only has an English model
      // installed — it silently transcribes everything as English instead
      // of erroring, regardless of the `locale` we pass. Explicitly
      // requesting Google's recognizer (same engine web relies on) makes
      // the locale actually take effect for ta-IN/te-IN/kn-IN/ml-IN.
      await Voice.start(lang.code, { RECOGNIZER_ENGINE: 'GOOGLE' });
    } catch (err: any) {
      setError(err?.message || 'Could not start listening.');
      setListening(false);
    }
  }, []);

  const stop = useCallback(async () => {
    try { await Voice.stop(); } catch { /* already stopped */ }
  }, []);

  return { listening, transcript, partialTranscript, error, start, stop };
}
