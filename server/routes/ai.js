import express from 'express';
import { HfInference } from '@huggingface/inference';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { prompt, wardContext } = req.body;
    
    if (!process.env.HF_TOKEN || process.env.HF_TOKEN === 'YOUR_HF_TOKEN_HERE') {
      return res.json({ 
        response: "🤖 **AI Civic Intelligence**:\n\nHello! The AI service is currently in **Setup Mode**. The Administrator needs to configure the `HF_TOKEN` in the `.env` file to activate me.\n\nOnce configured, I can help you with:\n- Pothole and road repair tracking\n- Finding your Ward Engineer\n- Garbage collection schedules\n- Government schemes" 
      });
    }

    const hf = new HfInference(process.env.HF_TOKEN);

    // Build rich system prompt with ward directory injected
    const directorySection = wardContext
      ? `\n\n## WARD OFFICIAL DIRECTORY (USE THIS FOR ALL CONTACT QUERIES)\nYou have access to the following real official contacts for the Bengaluru GBA ward. Always cite these when answering questions about who to contact:\n\n${wardContext}\n\nWhen a citizen asks "who should I contact for X?" or mentions a problem, ALWAYS look up the relevant official and provide their name, role, and phone number from the directory above.`
      : '';

    const systemPrompt = `You are a professional, helpful, and highly knowledgeable Civic Assistant for the Bengaluru Civic Portal (ADDA_360 Ward Connect). Your job is to help citizens of the ward with civic issues, complaint filing, tracking, and official contact details.

IMPORTANT RULES:
- Always be specific, actionable, and empathetic.
- Format responses using Markdown — use **bold** for names/numbers, bullet points for lists, and headers where helpful.
- When asked about officials or contacts, ALWAYS refer to the ward directory below and cite exact phone numbers.
- For complaints, guide citizens on how to use the portal or escalate the issue.
- Keep responses concise (under 200 words unless detail is needed).${directorySection}`;
    
    let out = "";
    for await (const chunk of hf.chatCompletionStream({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      max_tokens: 600,
    })) {
      if (chunk.choices && chunk.choices.length > 0) {
        out += chunk.choices[0].delta.content;
      }
    }

    res.json({ response: out });
  } catch (err) {
    console.error('AI error:', err);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});


router.post('/analyze', async (req, res) => {
  try {
    const { photoData, description } = req.body;

    if (!process.env.HF_TOKEN) {
      return res.status(500).json({ error: 'HF_TOKEN not configured.' });
    }

    const hf = new HfInference(process.env.HF_TOKEN);
    let imageCaption = '';

    // If an image is provided, generate a caption
    if (photoData) {
      // Remove the base64 prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = photoData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer]);
      
      const captionResponse = await hf.imageToText({
        data: blob,
        model: "Salesforce/blip-image-captioning-large",
      });
      imageCaption = captionResponse.generated_text;
    }

    // Combine user description and image caption
    const textToAnalyze = `User Description: ${description || 'None provided'}. Image Analysis: ${imageCaption || 'No image provided'}`;

    // Prompt Llama model to categorize and prioritize
    const triagePrompt = `You are an AI Triage system for the Bengaluru Civic Portal.
Analyze the following civic issue. 
${textToAnalyze}

You must return a JSON object with EXACTLY the following structure. Do not include any other text.
{
  "category": "one of: Road Repair & Potholes, Street Lighting, Sanitation / Garbage Collection, Water Supply & Drainage, Footpath / Pavement, Encroachment, Park / Public Space, Stray Animals, Noise / Pollution, Other",
  "priority": "one of: Low, Medium, High, Urgent",
  "score": "integer between 1 and 100 representing urgency",
  "summary": "A formal municipal specification describing the defect, location, and recommended action in 2-3 sentences."
}`;

    let triageResultText = "";
    for await (const chunk of hf.chatCompletionStream({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [{ role: "user", content: triagePrompt }],
      max_tokens: 300,
    })) {
      if (chunk.choices && chunk.choices.length > 0) {
        triageResultText += chunk.choices[0].delta.content;
      }
    }

    // Attempt to parse JSON from the response (extract if enclosed in markdown code blocks)
    let jsonMatch = triageResultText.match(/```json\n([\s\S]*?)\n```/);
    let rawJson = jsonMatch ? jsonMatch[1] : triageResultText;
    
    // Fallback cleanup
    rawJson = rawJson.replace(/^[^{]*{/, '{').replace(/}[^}]*$/, '}');

    const triageData = JSON.parse(rawJson);
    
    res.json(triageData);
  } catch (err) {
    console.error('AI Analyze error:', err);
    res.status(500).json({ error: 'Failed to analyze complaint' });
  }
});

export default router;
