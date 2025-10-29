export const groqAPI = {
  async generateConceptSummary(_text: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `Key concepts identified in your text:\n\n• Core principles and fundamental ideas\n• Important relationships between concepts\n• Critical processes and mechanisms\n• Practical applications and examples\n\nThis content covers essential topics that are perfect for the Feynman technique. Try explaining these concepts in your own simple words!`;
  },

  startRecording: async (onTranscript: (text: string) => void, onComplete: () => void) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.start();
    console.log("🎤 Groq recording started...");

    const stopRecording = (): Promise<string> => {
      return new Promise((resolve, reject) => {
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", blob, "recording.webm");         

          try {
            const res = await fetch("http://localhost:5000/api/groq-transcribe", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();
            onTranscript(data.transcript);
            onComplete();
            resolve(data.transcript);
          } catch (err) {
            console.error("Error sending audio to Groq API:", err);
            onComplete();
            reject(err);
          }
        };

        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      });
    };

    return { 
      stopRecording,
      stop: () => {
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
        onComplete();
      }
    };
  },
};

// Evaluate explanation using Groq backend
export async function evaluateExplanation(original: string, explanation: string) {
  const res = await fetch("http://localhost:5000/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalText: original, explanation }),
  });

  return await res.json();
}
