import { useState } from "react";
import { groqAPI } from "../utils/groqApis";

interface Props {
  explanation: string; // what the user said initially
  onFinish: (answers: string[]) => void; // callback when done
}

export const AIQuestionFlow: React.FC<Props> = ({ explanation, onFinish }) => {
  const [questions, setQuestions] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [passes, setPasses] = useState(0);
  const [transcript, setTranscript] = useState("");

  // Generate follow-up questions once
  const startQuestions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/groq-generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanation }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (err) {
      console.error("❌ Error generating questions:", err);
    }
  };

  const handleAnswer = async () => {
    setIsRecording(true);
    setTranscript("🎤 Listening...");

    // simulate mock speech input (replace later with whisperAPI)
    setTimeout(() => {
      const fakeAnswer = "Because sunlight provides the energy plants need to make glucose.";
      setAnswers(prev => [...prev, fakeAnswer]);
      setTranscript(fakeAnswer);
      setIsRecording(false);

      if (current + 1 < questions.length) {
        setCurrent(prev => prev + 1);
      } else {
        onFinish([...answers, fakeAnswer]);
      }
    }, 4000);
  };

  const handlePass = () => {
    if (passes + 1 >= 3) {
      onFinish(answers);
    } else {
      setPasses(passes + 1);
      if (current + 1 < questions.length) setCurrent(prev => prev + 1);
      else onFinish(answers);
    }
  };

  if (questions.length === 0) {
    return (
      <button
        onClick={startQuestions}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Start Follow-up Questions
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow border border-periwinkle-200">
        <p className="text-lg font-semibold text-slate-800 mb-2">
          {questions[current]}
        </p>
        <p className="text-sm text-slate-600 mb-4">
          {isRecording ? "Recording your answer..." : "Click 'Answer' to respond or 'Pass' to skip."}
        </p>

        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-full border-4 ${
              isRecording ? "border-red-500 animate-pulse" : "border-slate-400"
            } flex items-center justify-center`}
          >
            🎙️
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleAnswer}
            disabled={isRecording}
            className="bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Answer
          </button>
          <button
            onClick={handlePass}
            disabled={isRecording}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
          >
            Pass ({passes}/3)
          </button>
        </div>
      </div>

      {/* Transcript Section */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h4 className="font-semibold text-slate-700 mb-2">Transcript</h4>
        {answers.map((a, i) => (
          <p key={i} className="text-slate-700 mb-1">
            <strong>Q{i + 1}:</strong> {questions[i]}  
            <br />
            <strong>A{i + 1}:</strong> {a}
          </p>
        ))}
        {transcript && (
          <p className="text-slate-600 italic">🎧 {transcript}</p>
        )}
      </div>
    </div>
  );
};
