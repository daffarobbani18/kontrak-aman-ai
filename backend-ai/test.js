const { GoogleGenerativeAI } = require("@google/generative-ai"); 
async function test() { 
  const genAI = new GoogleGenerativeAI("AQ.Ab8RN6JqX0DUV5QwmYmhRkpV1PU3qu8Vt0myh4QhC9kpiVFTDw"); 
  const models = ["gemini-3.5-flash-lite", "gemma-4-26b-a4b-it"];
  for (const m of models) {
    try { 
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Halo"); 
      console.log(m + ":", result.response.text()); 
    } catch (error) { 
      console.error(m + " Error:", error.message); 
    } 
  }
} 
test();
