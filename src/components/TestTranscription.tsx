/*
// src/components/TestTranscription.tsx
import { useState, useRef } from "react";

export function TestTranscription() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");
      
        console.log("🎙️ Sending audio to Whisper...");
        const response = await fetch("http://localhost:5000/api/transcribe", {
          method: "POST",
          body: formData,
        });
      
        const data = await response.json();
      
        if (data.transcript) {
          console.log("✅ Transcription complete:", data.transcript);
          setTranscript(data.transcript);
        } else {
          console.error("❌ Transcription failed:", data);
          setTranscript("⚠️ Transcription failed. Check the console for details.");
        }
      };      

      mediaRecorder.start();
      setRecording(true);
      console.log("🎤 Recording started...");
    } catch (error) {
      console.error("🎧 Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      console.log("🛑 Stopping recording...");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🎧 Whisper Transcription Test</h1>
      <button
        onClick={recording ? stopRecording : startRecording}
        className={`px-4 py-2 rounded ${
          recording ? "bg-red-500" : "bg-green-500"
        } text-white`}
      >
        {recording ? "Stop Recording" : "Start Recording"}
      </button>

      {transcript && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <h2 className="font-semibold mb-2">Transcript:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}
*/
