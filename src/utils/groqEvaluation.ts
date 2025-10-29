// src/utils/groqEvaluation.ts
export async function generateDynamicQuestions(explanation: string) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: "You are an interactive tutor who asks thoughtful follow-up questions to deepen understanding."
            },
            {
              role: "user",
              content: `
  Here is the student's explanation:
  
  "${explanation}"
  
  Generate 3–5 short, focused follow-up questions to help test comprehension and fill gaps.
  Return ONLY a JSON array of strings, no other text.
  `
            }
          ],
          temperature: 0.7,
        }),
      });
  
      const data = await response.json();
      console.log("🧠 Dynamic question generation response:", data);
  
      const content = data.choices?.[0]?.message?.content || "[]";
      return JSON.parse(content);
    } catch (error) {
      console.error("❌ Error generating dynamic questions:", error);
      return [
        "Can you explain that concept more simply?",
        "Why is this process important?",
        "How would you describe this to a child?"
      ];
    }
  }
  