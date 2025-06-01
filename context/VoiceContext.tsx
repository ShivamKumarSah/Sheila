// project/context/VoiceContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

type VoiceResponse = {
  command: string;
  response: string;
  accuracy?: number;          // e.g. 0.92
  inferenceTimeMs?: number;   // e.g. 145
  sensorData?: {
    temperature: number;
    humidity: number;
    noise: number;
    motion: string;
  };
  timestamp: string;          // ISO string
};

type VoiceContextType = {
  isListening: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  lastResponse: VoiceResponse | null;
  responseHistory: VoiceResponse[];
};

const VoiceContext = createContext<VoiceContextType>({
  isListening: false,
  startListening: async () => {},
  stopListening: async () => {},
  lastResponse: null,
  responseHistory: [],
});

/**
 * Replace this with your actual Flask/ESP32 IP:PORT.
 * E.g.: http://192.168.1.100:5000/process_audio
 */
const FLASK_ENDPOINT = 'http://<YOUR_PI_IP>:5000/process_audio';

export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null);
  const [responseHistory, setResponseHistory] = useState<VoiceResponse[]>([]);

  // Request microphone permissions on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Microphone Permission',
            'This app needs microphone permission to record your voice.'
          );
        }
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    })();
  }, []);

  /**
   * startListening()
   * Initializes a new Recording instance and begins recording.
   */
  const startListening = async () => {
    try {
      if (Platform.OS === 'web') {
        Alert.alert('Unsupported', 'Voice recording is not supported on web.');
        return;
      }

      setIsListening(true);

      // Create a high-quality recording preset
      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recordingObject.startAsync();
      setRecording(recordingObject);
    } catch (err) {
      console.error('[VoiceContext] startListening error:', err);
      Alert.alert('Recording Error', 'Could not start audio recording.');
      setIsListening(false);
    }
  };

  /**
   * stopListening()
   * Stops the Recording, fetches the local URI, and
   * sends that file to the Flask endpoint. Then processes the response.
   */
  const stopListening = async () => {
    try {
      if (!recording) {
        return;
      }

      await recording.stopAndUnloadAsync();
      setIsListening(false);

      // Get URI of the recorded file (usually .caf/.m4a on iOS, .wav on Android)
      const uri = recording.getURI();
      setRecording(null);

      if (!uri) {
        throw new Error('Recording URI not found');
      }

      // Upload to Flask as multipart/form-data
      const formData = new FormData();
      /**
       * On Android, the type will usually be 'audio/m4a' or 'audio/mp4'.
       * Adjust accordingly if you forcibly record WAV. Many demos simply send 'audio/x-wav'.
       */
      formData.append('audio', {
        uri,
        name: 'voice_command.wav',
        type: 'audio/wav',
      } as any);

      const resp = await fetch(FLASK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('[VoiceContext] bad status:', resp.status, text);
        throw new Error(`Server returned ${resp.status}`);
      }

      // Expecting JSON: { command, response, accuracy, inference_time_ms, sensor_data }
      const json = await resp.json();

      const voiceResp: VoiceResponse = {
        command: json.command || 'unknown',
        response: json.response || 'No response text provided.',
        accuracy: json.accuracy,                    // e.g. 0.93
        inferenceTimeMs: json.inference_time_ms,    // e.g. 120
        sensorData: json.sensor_data,               // { temperature, humidity, noise, motion }
        timestamp: new Date().toISOString(),
      };

      setLastResponse(voiceResp);
      setResponseHistory((prev) => [voiceResp, ...prev]);

      // Use TTS to speak the `response` text
      if (voiceResp.response) {
        Speech.speak(voiceResp.response, {
          pitch: 1.0,
          rate: 1.0,
        });
      }
    } catch (err) {
      console.error('[VoiceContext] stopListening error:', err);
      Alert.alert('Upload Error', (err as Error).message);
      setIsListening(false);
      setRecording(null);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        isListening,
        startListening,
        stopListening,
        lastResponse,
        responseHistory,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);


// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { Alert, Platform } from 'react-native';
// import * as Speech from 'expo-speech';
// import { Audio } from 'expo-av';

// type VoiceResponse = {
//   command: string;
//   response: string;
//   timestamp: string;
// };

// type VoiceContextType = {
//   isListening: boolean;
//   startListening: () => void;
//   stopListening: () => void;
//   lastResponse: VoiceResponse | null;
//   responseHistory: VoiceResponse[];
// };

// const VoiceContext = createContext<VoiceContextType>({
//   isListening: false,
//   startListening: () => {},
//   stopListening: () => {},
//   lastResponse: null,
//   responseHistory: [],
// });

// // Demo responses for simulating voice interactions
// const DEMO_RESPONSES = [
//   { 
//     command: "What's the weather like today?",
//     response: "It's currently 24 degrees and sunny with a few clouds. There's a 10% chance of rain later this afternoon.",
//   },
//   {
//     command: "Turn on the living room lights",
//     response: "I've turned on the living room lights for you.",
//   },
//   {
//     command: "Set a timer for 5 minutes",
//     response: "Timer set for 5 minutes starting now.",
//   },
//   {
//     command: "Play some jazz music",
//     response: "Playing jazz music from your favorites playlist.",
//   },
//   {
//     command: "What's in the news today?",
//     response: "Here are today's top headlines: Scientists discover new renewable energy source. Global markets show strong growth. New climate agreement reached between major nations.",
//   },
//   {
//     command: "How are you doing today?",
//     response: "I'm doing well, thank you for asking! How can I assist you today?",
//   },
// ];

// export function VoiceProvider({ children }: { children: React.ReactNode }) {
//   const [isListening, setIsListening] = useState(false);
//   const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null);
//   const [responseHistory, setResponseHistory] = useState<VoiceResponse[]>([]);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);

//   // Set up audio recording permissions for native platforms only
//   useEffect(() => {
//     if (Platform.OS !== 'web') {
//       (async () => {
//         const { status } = await Audio.requestPermissionsAsync();
//         if (status !== 'granted') {
//           Alert.alert('Permission required', 'Microphone permission is required for voice commands');
//         }
//       })();
//     }
//   }, []);

//   // Simulate starting to listen
//   const startListening = async () => {
//     try {
//       setIsListening(true);
      
//       // Simulate voice recording and processing
//       setTimeout(async () => {
//         await stopListening();
//       }, 3000);
//     } catch (error) {
//       console.error('Failed to start listening:', error);
//       setIsListening(false);
//     }
//   };

//   // Simulate stopping listening and processing the command
//   const stopListening = async () => {
//     try {
//       if (isListening) {
//         setIsListening(false);
        
//         // Simulate processing delay
//         setTimeout(() => {
//           // Choose a random response from the demo responses
//           const randomResponse = DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
          
//           const newResponse = {
//             command: randomResponse.command,
//             response: randomResponse.response,
//             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           };
          
//           setLastResponse(newResponse);
//           setResponseHistory(prev => [newResponse, ...prev]);
          
//           // Only use Speech.speak on native platforms
//           if (Platform.OS !== 'web') {
//             Speech.speak(newResponse.response, {
//               language: 'en',
//               pitch: 1.0,
//               rate: 0.9,
//             });
//           }
//         }, 1000);
//       }
//     } catch (error) {
//       console.error('Failed to stop listening:', error);
//     }
//   };

//   return (
//     <VoiceContext.Provider
//       value={{
//         isListening,
//         startListening,
//         stopListening,
//         lastResponse,
//         responseHistory,
//       }}
//     >
//       {children}
//     </VoiceContext.Provider>
//   );
// }

// export const useVoice = () => useContext(VoiceContext);