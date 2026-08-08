import { useState, useEffect, useCallback, useRef } from 'react';

// Browser support is currently Chrome/Edge (full support) and Safari (partial, may vary by version) — Firefox does not support the Web Speech API as of now.
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
export const isSupported = !!SpeechRecognition;

const useVoiceSearch = (onFinal) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    if (!isSupported) return;
    
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'en-IN';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
      
      if (event.results[0].isFinal && onFinalRef.current) {
         onFinalRef.current(event.results[0][0].transcript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      let errorMessage = "Voice search isn't working right now.";
      if (event.error === 'not-allowed') {
        errorMessage = "Microphone access denied. Please allow microphone access in your browser.";
      } else if (event.error === 'no-speech') {
        errorMessage = "Didn't catch that — try again.";
      } else if (event.error === 'network') {
        errorMessage = "Voice search needs an internet connection.";
      }
      setError(errorMessage);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    setError('');
    setTranscript('');
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (err) {
      // ignore start errors if already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!isSupported) return;
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return { isListening, transcript, error, startListening, stopListening, isSupported };
};

export default useVoiceSearch;
