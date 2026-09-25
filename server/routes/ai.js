import express from "express";
import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Helper: Build comprehensive domain system prompt
function buildSystemPrompt(wardContext) {
  const directorySection = wardContext
    ? `\n\n## OFFICIAL CONTACT DIRECTORY:\n${wardContext}\nWhen answering who to contact, ALWAYS cite specific names, designations, and mobile numbers from this directory.`
    : "";

  return `You are "Sahaya AI", an expert, empathetic, and 24/7 Civic Assistant for the Bengaluru Municipal Corporation & Ward Connect portal (ADDA_360).
Your mission is to provide accurate, authoritative, and actionable civic assistance to citizens in English and Kannada.

KEY KNOWLEDGE BASE:
- Emergency Helplines: Police: **112**, BBMP Control Room: **1533**, BESCOM (Electricity): **1912**, BWSSB (Water & Sewerage): **1916**, Ambulance: **108**, Women Helpline: **1091**.
- Portal Navigation:
  * File a Grievance: [File New Complaint](/complaints)
  * Track Ticket Status: [Track Complaint](/track)
  * Ward Official Contacts: [Ward Directory](/directory)
  * Government Schemes: [Citizen Welfare Schemes](/schemes)
  * Ward Survey & Polls: [Participate in Survey](/survey)
  * Ward Ongoing Projects: [Ward Projects](/projects)
- Common Civic Standards & SLAs:
  * Potholes / Road issues: 48 to 72 hours SLA after verification
  * Street light outages: 24 to 48 hours SLA
  * Garbage Collection: Daily door-to-door (6:30 AM - 10:30 AM). Wet (green bin), Dry (blue bin), Sanitary wrapped separately.
  * Water supply contamination / leakage: Immediate priority escalation via BWSSB 1916.
- Official Roles:
  * AEE (Assistant Executive Engineer): Major road, civil engineering, storm water drain infrastructure.
  * AE / JE (Assistant/Junior Engineer): Ward-level localized civil repairs and streetlights.
  * Senior Health Inspector (SHI): Sanitation, garbage dumps, solid waste management, fogging.
  * Corporator / Ward Committee: Local policy, grievance escalation, community audits.

RESPONSE GUIDELINES:
1. Be structured, polite, and direct. Use **bolding**, lists, and clear steps.
2. If the user mentions a specific problem (e.g. pothole, broken streetlight, garbage dump), immediately suggest filing a complaint with the link [File New Complaint](/complaints) and provide the relevant helpline/official.
3. Understand Kannada or "Kanglish" queries and reply in Kannada or bilingual if addressed in Kannada.
4. Keep answers under 250 words, fast to read on mobile.${directorySection}`;
}

// Smart Local Fallback Engine if cloud AI is unavailable or rate-limited
function getLocalCivicResponse(prompt, wardContext) {
  const p = (prompt || "").toLowerCase();

  if (/hi|hello|hey|namaste|namaskara/i.test(p) && p.length < 25) {
    return `👋 **Namaskara! I am Sahaya AI, your 24/7 Civic Assistant.**

I can help you with:
- 🛣️ **Filing Grievances**: [File New Complaint](/complaints) (Potholes, garbage, lights)
- 🔍 **Tracking Tickets**: [Track Complaint Status](/track)
- 📞 **Ward Officials & Engineers**: [View Ward Directory](/directory)
- 💧 **Water & Power Helplines**: BESCOM (1912), BWSSB (1916), BBMP (1533)
- 📜 **Citizen Schemes**: [Welfare Schemes & Benefits](/schemes)

How can I assist your neighborhood today?`;
  }

  if (/pothole|road|footpath|asphalt|tar|crater|pavement/i.test(p)) {
    return `🛣️ **Road & Pothole Repair Assistance**

1. **Submit via Portal**: You can report potholes with location GPS and photo evidence at **[File New Complaint](/complaints)**.
2. **Official Escalation**: Contact your Ward Assistant Executive Engineer (AEE) or Junior Engineer via the **[Ward Directory](/directory)**.
3. **BBMP Sahaya Helpline**: Call **1533** or toll-free **080-22660000**.
4. **Standard SLA**: Official BBMP resolution time for critical road potholes is **48–72 hours**.`;
  }

  if (/garbage|waste|clean|dump|trash|sanitation|sweeper|pourakarmika/i.test(p)) {
    return `🗑️ **Garbage & Sanitation Services**

- **Collection Timings**: Daily door-to-door collection runs from **6:30 AM to 10:30 AM**.
- **Segregation Protocol**:
  * 🟢 **Green Bin**: Wet/organic kitchen waste.
  * 🔵 **Blue Bin**: Dry recyclable plastic, paper, metal.
  * 🔴 **Red Wrap**: Sanitary and bio-medical waste.
- **Blackspots & Illegal Dumping**: Please snap a photo and file a report at **[File New Complaint](/complaints)**.
- **Department Contact**: Reach the Senior Health Inspector (SHI) for your ward in the **[Ward Directory](/directory)**.`;
  }

  if (/water|leak|drain|sewage|bwssb|pipe|kaveri|cauvery/i.test(p)) {
    return `💧 **Water Supply & Sewage Assistance**

- **BWSSB 24/7 Helpline**: Call **1916** for Cauvery water supply disruption, low pressure, or pipeline leaks.
- **Sewage Overflow / Blocked Drains**: File an urgent report at **[File New Complaint](/complaints)** under the *Drainage & Water Supply* category.
- **Responsible Officer**: BWSSB Assistant Executive Engineer (AEE - Water Supply). Check exact numbers in our **[Ward Directory](/directory)**.`;
  }

  if (/light|electricity|power|bescom|dark|pole|wire/i.test(p)) {
    return `💡 **Streetlight & Electricity Inquiries**

- **BESCOM 24/7 Helpline**: Call **1912** or WhatsApp **9449844640** for electrical faults or live wires.
- **Non-functional Streetlights**: Report defective fixtures via **[File New Complaint](/complaints)**. Expected resolution time is **24 to 48 hours**.
- **Ward Electrician / Junior Engineer**: Check contacts in the **[Ward Directory](/directory)**.`;
  }

  if (/official|engineer|contact|phone|number|aee|corporator|mla|who.*contact/i.test(p)) {
    return `📞 **Ward Governance & Official Contacts**

You can view the full roster of verified municipal engineers, health inspectors, and elected representatives at:
👉 **[Open Ward Official Directory](/directory)**

Key BBMP numbers:
- **BBMP Central Control Room**: 1533 / 080-22660000
- **Traffic Police**: 103 / 080-22943030
- **Emergency Police**: 112`;
  }

  if (/track|status|ticket|complaint id|where is my/i.test(p)) {
    return `🔍 **Track Your Complaint**

You can check the real-time status, official notes, and before-and-after photo verification of any grievance:
👉 **[Go to Track Complaint Page](/track)**

Enter your Complaint Tracking ID (e.g. \`CHM-2026-...\`) or your registered 10-digit mobile number.`;
  }

  if (/scheme|subsidy|gruha|shakti|yuvonidhi|kalyana|bjp|government/i.test(p)) {
    return `📜 **Government & Citizen Welfare Schemes**

Explore welfare benefits, eligibility criteria, and application links at:
👉 **[Welfare Schemes Portal](/schemes)**

Popular programs include:
- **Gruha Jyothi**: Free electricity up to 200 units.
- **Gruha Lakshmi**: Monthly financial assistance for women heads of household.
- **Shakti Scheme**: Free bus travel for women across Karnataka state transport.
- **Ayushman Bharat / PM-JAY**: Cashless healthcare coverage up to ₹5 Lakhs.`;
  }

  if (/emergency|ambulance|fire|police|accident/i.test(p)) {
    return `🚨 **Emergency Helplines (Bangalore)**

- **Police Emergency**: **112**
- **Ambulance (Health Emergency)**: **108**
- **Fire & Rescue**: **101**
- **Women's Safety Helpline**: **1091**
- **Senior Citizens Helpline**: **1090**
- **Child Helpline**: **1098**
- **BBMP Disaster Control**: **080-22221188** / **1533**`;
  }

  return `🤖 **Sahaya Civic Assistant**

Thank you for your inquiry. To resolve this quickly for your neighborhood:
- If this is a physical grievance (pothole, streetlight, garbage, flooding), please **[File a Complaint](/complaints)** so the assigned Ward Engineer receives automated SMS/email alerts.
- To contact your localized BBMP, BESCOM, or BWSSB engineer directly, visit the **[Ward Directory](/directory)**.
- For emergency municipal escalations, dial BBMP Sahaya at **1533** or Police at **112**.`;
}

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { prompt, wardContext, history = [] } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemPrompt = buildSystemPrompt(wardContext);

    // ──────────────────────────────────────────────────────────
    // Tier 1: Google Gemini (fastest, smartest, rich multilingual)
    // ──────────────────────────────────────────────────────────
    if (
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "YOUR_GEMINI_KEY_HERE" &&
      process.env.GEMINI_API_KEY.trim().length > 10
    ) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Try gemini-1.5-flash or gemini-2.0-flash
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: systemPrompt,
        });

        // Format history for Gemini SDK
        const geminiHistory = (history || [])
          .filter((m) => m && m.text && m.sender)
          .slice(-6)
          .map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(prompt);
        const reply = result.response.text();

        if (reply && reply.trim()) {
          return res.json({ response: reply.trim(), provider: "gemini" });
        }
      } catch (geminiErr) {
        console.warn("Gemini API error, falling back:", geminiErr.message);
      }
    }

    // ──────────────────────────────────────────────────────────
    // Tier 2: Hugging Face Inference (Qwen2.5 or Llama 3)
    // ──────────────────────────────────────────────────────────
    if (
      process.env.HF_TOKEN &&
      process.env.HF_TOKEN !== "YOUR_HF_TOKEN_HERE" &&
      process.env.HF_TOKEN.trim().length > 10
    ) {
      try {
        const hf = new HfInference(process.env.HF_TOKEN);

        const messages = [{ role: "system", content: systemPrompt }];

        // Add recent conversation history (last 4 turns)
        if (Array.isArray(history)) {
          history.slice(-4).forEach((m) => {
            if (m && m.text && m.sender) {
              messages.push({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text,
              });
            }
          });
        }

        messages.push({ role: "user", content: prompt });

        const response = await hf.chatCompletion({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages,
          max_tokens: 600,
          temperature: 0.7,
        });

        const reply = response.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return res.json({ response: reply.trim(), provider: "huggingface" });
        }
      } catch (hfErr) {
        console.warn("HuggingFace API error, falling back:", hfErr.message);
      }
    }

    // ──────────────────────────────────────────────────────────
    // Tier 3: Local Civic Knowledge Engine (Zero-fail fallback)
    // ──────────────────────────────────────────────────────────
    const fallbackResponse = getLocalCivicResponse(prompt, wardContext);
    return res.json({ response: fallbackResponse, provider: "local-civic-engine" });
  } catch (err) {
    console.error("AI chat general error:", err);
    return res.json({
      response: getLocalCivicResponse(req.body?.prompt, req.body?.wardContext),
      provider: "local-fallback",
    });
  }
});

// POST /api/chat/analyze (Image & Description Grievance Triage)
router.post("/analyze", async (req, res) => {
  try {
    const { photoData, description } = req.body;

    // Default structure
    const fallbackTriage = {
      category: "Road Repair & Potholes",
      priority: "Medium",
      score: 65,
      summary: description
        ? `Citizen reported: ${description}`
        : "Visual evidence submitted for ward inspection.",
    };

    // If Gemini key is available, use multimodal or text categorization
    if (
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "YOUR_GEMINI_KEY_HERE" &&
      process.env.GEMINI_API_KEY.trim().length > 10
    ) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const promptText = `You are an AI Triage system for the Bengaluru Civic Portal.
Analyze the following civic issue:
User description: "${description || "None provided"}"

Return a STRICT JSON object only (no markdown, no extra text):
{
  "category": "one of: Road Repair & Potholes, Street Lighting, Sanitation / Garbage Collection, Water Supply & Drainage, Footpath / Pavement, Encroachment, Park / Public Space, Stray Animals, Noise / Pollution, Other",
  "priority": "one of: Low, Medium, High, Urgent",
  "score": integer between 1 and 100,
  "summary": "Formal municipal defect specification in 2 sentences"
}`;

        const parts = [{ text: promptText }];

        if (photoData && photoData.startsWith("data:image/")) {
          const match = photoData.match(/^data:(image\/\w+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }

        const result = await model.generateContent(parts);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return res.json(JSON.parse(jsonMatch[0]));
        }
      } catch (geminiErr) {
        console.warn("Gemini analyze failed, trying HuggingFace...", geminiErr.message);
      }
    }

    // Hugging Face fallback
    if (
      process.env.HF_TOKEN &&
      process.env.HF_TOKEN !== "YOUR_HF_TOKEN_HERE" &&
      process.env.HF_TOKEN.trim().length > 10
    ) {
      try {
        const hf = new HfInference(process.env.HF_TOKEN);
        let imageCaption = "";

        if (photoData) {
          const base64Data = photoData.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          const blob = new Blob([buffer]);

          const captionResponse = await hf.imageToText({
            data: blob,
            model: "Salesforce/blip-image-captioning-large",
          });
          imageCaption = captionResponse.generated_text;
        }

        const textToAnalyze = `Description: ${description || "None"}. Photo Analysis: ${imageCaption || "None"}`;
        const triagePrompt = `You are an AI Triage system for the Bengaluru Civic Portal.
Analyze the following: ${textToAnalyze}
Return ONLY a JSON object:
{
  "category": "Road Repair & Potholes",
  "priority": "Medium",
  "score": 60,
  "summary": "Brief 2-sentence description"
}`;

        const response = await hf.chatCompletion({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages: [{ role: "user", content: triagePrompt }],
          max_tokens: 300,
        });

        const reply = response.choices?.[0]?.message?.content || "";
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return res.json(JSON.parse(jsonMatch[0]));
        }
      } catch (hfErr) {
        console.warn("HF analyze failed:", hfErr.message);
      }
    }

    // Heuristic triage fallback
    const d = (description || "").toLowerCase();
    if (/light|pole|bulb|dark/i.test(d)) {
      fallbackTriage.category = "Street Lighting";
      fallbackTriage.priority = "High";
      fallbackTriage.score = 75;
    } else if (/garbage|waste|smell|dump/i.test(d)) {
      fallbackTriage.category = "Sanitation / Garbage Collection";
      fallbackTriage.priority = "High";
      fallbackTriage.score = 80;
    } else if (/water|leak|pipe|drain|flood/i.test(d)) {
      fallbackTriage.category = "Water Supply & Drainage";
      fallbackTriage.priority = "Urgent";
      fallbackTriage.score = 90;
    }

    res.json(fallbackTriage);
  } catch (err) {
    console.error("AI Analyze error:", err);
    res.status(500).json({ error: "Failed to analyze complaint" });
  }
});

export default router;
