// Browser Web Speech API helper with safe SSR check and fallback

export interface SpeechRecognitionResultType {
  transcript: string;
  isFinal: boolean;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function createSpeechListener(
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void
): { start: () => void; stop: () => void } {
  if (typeof window === "undefined" || !isSpeechRecognitionSupported()) {
    return {
      start: () => onError("Speech recognition is not supported in this browser environment."),
      stop: () => {},
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let recognition: any = null;

  try {
    recognition = new SpeechClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const text = final || interim;
      if (text.trim()) {
        onTranscript(text.trim(), Boolean(final));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      onError(event.error === "not-allowed" ? "Microphone access was denied." : `Speech error: ${event.error}`);
    };

    recognition.onend = () => {
      onEnd();
    };
  } catch (err) {
    console.warn("Speech recognition initialization failed:", err);
  }

  return {
    start: () => {
      try {
        if (recognition) recognition.start();
      } catch (e) {
        console.warn("Recognition start error:", e);
      }
    },
    stop: () => {
      try {
        if (recognition) recognition.stop();
      } catch (e) {
        console.warn("Recognition stop error:", e);
      }
    },
  };
}
