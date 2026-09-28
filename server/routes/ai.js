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

  // Kannada language query support
  if (/ನಮಸ್ಕಾರ|ಹಲೋ|ದೂರು|ಗುಂಡಿ|ರಸ್ತೆ|ಕಸ|ನೀರು|ವಿದ್ಯುತ್|ಬೆಸ್ಕಾಂ|ಅಧಿಕಾರಿ/i.test(prompt)) {
    return `🙏 **ನಮಸ್ಕಾರ! ಸಹಾಯ ನಾಗರಿಕ ಸಹಾಯವಾಣಿಗೆ ಸ್ವಾಗತ (Sahaya AI).**

ನಾನು ನಿಮ್ಮ ವಾರ್ಡ್‌ನ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳಿಗೆ ನೆರವಾಗಬಲ್ಲೆ:
- 🛣️ **ರಸ್ತೆ ಗುಂಡಿ ಅಥವಾ ಕಾಲುದಾರಿ ದೂರು**: **[ಹೊಸ ದೂರು ದಾಖಲಿಸಿ](/complaints)**
- 🔍 **ನಿಮ್ಮ ದೂರಿನ ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ**: **[ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ](/track)**
- 📞 **ವಾರ್ಡ್ ಇಂಜಿನಿಯರ್ ಹಾಗೂ ಅಧಿಕಾರಿಗಳ ಸಂಪರ್ಕ**: **[ಅಧಿಕಾರಿಗಳ ವಿವರ](/directory)**
- 🚨 **ತುರ್ತು ಸಹಾಯವಾಣಿಗಳು**: ಪೊಲೀಸ್ (**112**), ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ (**1912**), ಜಲಮಂಡಳಿ ನೀರು (**1916**), ಬಿಬಿಎಂಪಿ (**1533**).

ನಿಮಗೆ ಯಾವ ವಿಷಯದಲ್ಲಿ ಸಹಾಯ ಬೇಕು?`;
  }

  if (/hi|hello|hey|namaste|namaskara/i.test(p) && p.length < 35) {
    return `👋 **Namaskara! I am Sahaya AI, your 24/7 Civic Assistant.**

I can instantly assist you with:
- 🛣️ **Filing Grievances**: [File New Complaint](/complaints) *(Potholes, garbage, streetlights)*
- 🔍 **Tracking Tickets**: [Track Complaint Status](/track)
- 📞 **Ward Officials & Engineers**: [View Ward Directory](/directory)
- 💧 **Utility Helplines**: BESCOM (**1912**), BWSSB (**1916**), BBMP (**1533**)
- 📜 **Citizen Schemes**: [Welfare Schemes & Benefits](/schemes)

How can I help you today?`;
  }

  if (/pothole|road|footpath|asphalt|tar|crater|pavement|repair/i.test(p)) {
    return `🛣️ **Road & Pothole Repair Assistance**

1. **Submit Online**: You can file a pothole grievance with GPS location and photo evidence at **[File New Complaint](/complaints)**.
2. **Official Escalation**: Your Ward Assistant Executive Engineer (AEE) receives instant automated notification.
3. **BBMP Control Room**: Call toll-free **1533** or **080-22660000**.
4. **Standard SLA**: Official BBMP resolution time for road potholes is **48–72 hours**.`;
  }

  if (/garbage|waste|clean|dump|trash|sanitation|sweeper|pourakarmika|smell/i.test(p)) {
    return `🗑️ **Garbage & Sanitation Services**

- **Door-to-Door Timings**: Daily collection runs from **6:30 AM to 10:30 AM**.
- **Segregation Protocol**:
  * 🟢 **Green Bin**: Wet/organic kitchen waste.
  * 🔵 **Blue Bin**: Dry recyclable plastic, paper, metal.
  * 🔴 **Red Wrap**: Sanitary and hazardous waste.
- **Report Blackspots**: Snap a picture and report at **[File New Complaint](/complaints)**.
- **Department Contact**: Reach the Senior Health Inspector (SHI) in the **[Ward Directory](/directory)**.`;
  }

  if (/water|leak|drain|sewage|bwssb|pipe|kaveri|cauvery|drinking/i.test(p)) {
    return `💧 **Water Supply & Drainage Assistance**

- **BWSSB 24/7 Helpline**: Call **1916** for Cauvery water supply disruption or pipe bursts.
- **Sewage Overflow / Blocked Drains**: File an urgent ticket at **[File New Complaint](/complaints)**.
- **Responsible Officer**: BWSSB Assistant Executive Engineer (AEE - Water Supply). View direct phone in the **[Ward Directory](/directory)**.`;
  }

  if (/light|electricity|power|bescom|dark|pole|wire|transformer/i.test(p)) {
    return `💡 **Streetlight & Electricity Inquiries**

- **BESCOM 24/7 Helpline**: Call **1912** or WhatsApp **9449844640** for power failures or dangerous live wires.
- **Defective Streetlights**: Report non-working fixtures via **[File New Complaint](/complaints)** *(24–48 hr SLA)*.
- **Ward Electrician**: Check direct contact details in the **[Ward Directory](/directory)**.`;
  }

  if (/official|engineer|contact|phone|number|aee|corporator|mla|who.*contact/i.test(p)) {
    return `📞 **Ward Governance & Official Directory**

You can view the full roster of verified municipal engineers, health inspectors, and elected representatives at:
👉 **[Open Ward Official Directory](/directory)**

Key BBMP numbers:
- **BBMP Control Room**: 1533 / 080-22660000
- **Traffic Police**: 103 / 080-22943030
- **Police Emergency**: 112`;
  }

  if (/track|status|ticket|complaint id|where is my|check/i.test(p)) {
    return `🔍 **Track Your Complaint**

You can check real-time progress, official resolution notes, and before-and-after photo verification at:
👉 **[Go to Track Complaint Page](/track)**

Enter your Complaint Tracking ID (e.g. \`CHM-2026-...\`) or your registered 10-digit mobile number.`;
  }

  if (/scheme|subsidy|gruha|shakti|yuvonidhi|kalyana|bjp|government|pmay/i.test(p)) {
    return `📜 **Government & Citizen Welfare Schemes**

Explore welfare benefits, eligibility criteria, and official portals at:
👉 **[Welfare Schemes Portal](/schemes)**

Popular programs include:
- **Gruha Jyothi**: Free electricity up to 200 units.
- **Gruha Lakshmi**: Monthly financial assistance for women heads of household.
- **Shakti Scheme**: Free bus travel for women across Karnataka state transport.
- **PMAY Urban**: Housing subsidy up to ₹2.67 Lakhs.`;
  }

  if (/emergency|ambulance|fire|police|accident|disaster/i.test(p)) {
    return `🚨 **Emergency Helplines (Bengaluru)**

- **Police Emergency**: **112**
- **Ambulance (Medical)**: **108**
- **Fire & Rescue**: **101**
- **Women's Safety Helpline**: **1091**
- **Senior Citizens Helpline**: **1090**
- **BBMP Disaster Control**: **080-22221188** / **1533**`;
  }

  return `🤖 **Sahaya Civic Assistant**

Thank you for your question! Here are the best ways to get this resolved:
- If this is an issue requiring ground inspection, please **[File a Complaint](/complaints)** so the assigned Ward Engineer receives automated SMS alerts.
- To reach your ward engineers and officials directly, visit the **[Ward Directory](/directory)**.
- For emergency municipal escalations, dial BBMP Sahaya at **1533** or Police at **112**.`;
}

// Helper: Fast promise timeout
const withTimeout = (promise, ms = 2500) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { prompt, wardContext, history = [] } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const trimmedPrompt = prompt.trim();
    const pLower = trimmedPrompt.toLowerCase();

    // Fast-path: Instant matching for common civic patterns (< 10ms)
    const isCivicPattern = /^(hi|hello|hey|namaskara|namaste)$|pothole|garbage|waste|water|sewage|drain|bescom|streetlight|official|engineer|track|status|scheme|subsidy|emergency|ambulance|police|ನಮಸ್ಕಾರ/i.test(
      pLower
    );

    // If query matches a known pattern or is a simple greeting, return instantly without network lag
    if (isCivicPattern && trimmedPrompt.length < 80) {
      const fastResponse = getLocalCivicResponse(trimmedPrompt, wardContext);
      return res.json({ response: fastResponse, provider: "instant-civic-engine" });
    }

    const systemPrompt = buildSystemPrompt(wardContext);

    // Tier 1: Google Gemini (if key present)
    if (
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "YOUR_GEMINI_KEY_HERE" &&
      process.env.GEMINI_API_KEY.trim().length > 10
    ) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          systemInstruction: systemPrompt,
        });

        const geminiHistory = (history || [])
          .filter((m) => m && m.text && m.sender)
          .slice(-4)
          .map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await withTimeout(chat.sendMessage(trimmedPrompt), 3000);
        const reply = result.response.text();

        if (reply && reply.trim()) {
          return res.json({ response: reply.trim(), provider: "gemini" });
        }
      } catch (geminiErr) {
        console.warn("Gemini API error, falling back:", geminiErr.message);
      }
    }

    // Tier 2: Hugging Face Inference (with strict 2.5s timeout for speed)
    if (
      process.env.HF_TOKEN &&
      process.env.HF_TOKEN !== "YOUR_HF_TOKEN_HERE" &&
      process.env.HF_TOKEN.trim().length > 10
    ) {
      try {
        const hf = new HfInference(process.env.HF_TOKEN);
        const messages = [
          {
            role: "system",
            content:
              "You are Sahaya AI, Bengaluru Municipal Civic Assistant. Keep responses concise, helpful, and under 150 words.",
          },
        ];

        if (Array.isArray(history)) {
          history.slice(-2).forEach((m) => {
            if (m && m.text && m.sender) {
              messages.push({
                role: m.sender === "user" ? "user" : "assistant",
                content: m.text,
              });
            }
          });
        }

        messages.push({ role: "user", content: trimmedPrompt });

        const responsePromise = hf.chatCompletion({
          model: "Qwen/Qwen2.5-72B-Instruct",
          messages,
          max_tokens: 220,
          temperature: 0.7,
        });

        const response = await withTimeout(responsePromise, 2500);
        const reply = response.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return res.json({ response: reply.trim(), provider: "huggingface" });
        }
      } catch (hfErr) {
        console.warn("HuggingFace timeout/error, using instant civic engine:", hfErr.message);
      }
    }

    // Tier 3: Local Civic Knowledge Engine (Zero-fail, instant response)
    const fallbackResponse = getLocalCivicResponse(trimmedPrompt, wardContext);
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
  const { photoData, description = "" } = req.body;
  const d = (description || "").toLowerCase();

  // Intelligent civic heuristics engine
  const fallbackTriage = {
    category: "Road Repair & Potholes",
    priority: "Medium",
    score: 65,
    summary: description
      ? `Reported civic defect: ${description.slice(0, 120)}`
      : "Visual evidence submitted for ward engineering triage.",
  };

  if (/light|bulb|lamp|pole|dark|wire|bescom|fuse|street.*light/i.test(d)) {
    fallbackTriage.category = "Street Lighting";
    fallbackTriage.priority = "High";
    fallbackTriage.score = 80;
    fallbackTriage.summary = "Defective municipal lighting reported. Nighttime safety hazard requiring BESCOM/BBMP electrical crew dispatch.";
  } else if (/garbage|waste|trash|dump|smell|stench|pourakarmika|debris|litter|bin/i.test(d)) {
    fallbackTriage.category = "Sanitation / Garbage Collection";
    fallbackTriage.priority = "High";
    fallbackTriage.score = 85;
    fallbackTriage.summary = "Solid waste accumulation detected. Escalated for Senior Health Inspector (SHI) mechanized clearing.";
  } else if (/water|leak|pipe|burst|drain|sewage|manhole|flooding|stagnant|cauvery|bwssb/i.test(d)) {
    fallbackTriage.category = "Water Supply & Drainage";
    fallbackTriage.priority = "Urgent";
    fallbackTriage.score = 92;
    fallbackTriage.summary = "Water supply leakage or sewage overflow reported. Critical utility escalation flagged for BWSSB emergency team.";
  } else if (/footpath|pavement|sidewalk|kerb|pedestrian|slab/i.test(d)) {
    fallbackTriage.category = "Footpath / Pavement";
    fallbackTriage.priority = "Medium";
    fallbackTriage.score = 70;
    fallbackTriage.summary = "Broken or missing footpath slabs endangering pedestrian transit. Assigned to Ward Junior Engineer.";
  } else if (/encroach|illegal.*construction|blocked.*path|vendor|shed/i.test(d)) {
    fallbackTriage.category = "Encroachment";
    fallbackTriage.priority = "High";
    fallbackTriage.score = 75;
    fallbackTriage.summary = "Public right-of-way obstruction reported. Queued for Ward Revenue & Enforcement inspection.";
  } else if (/park|garden|tree|branch|bench|playground/i.test(d)) {
    fallbackTriage.category = "Park / Public Space";
    fallbackTriage.priority = "Medium";
    fallbackTriage.score = 60;
    fallbackTriage.summary = "Public park infrastructure or greenery defect. Routed to BBMP Horticulture division.";
  } else if (/dog|stray|animal|bite|monkey|cattle|cow/i.test(d)) {
    fallbackTriage.category = "Stray Animals";
    fallbackTriage.priority = "Medium";
    fallbackTriage.score = 65;
    fallbackTriage.summary = "Stray animal nuisance or safety concern reported. Alert sent to Ward Animal Husbandry squad.";
  } else if (/noise|sound|speaker|pollution|smoke|dust|air/i.test(d)) {
    fallbackTriage.category = "Noise / Pollution";
    fallbackTriage.priority = "Medium";
    fallbackTriage.score = 60;
    fallbackTriage.summary = "Environmental nuisance reported exceeding allowable municipal thresholds.";
  } else if (/pothole|crater|asphalt|tar|road|ditch|hump/i.test(d)) {
    fallbackTriage.category = "Road Repair & Potholes";
    fallbackTriage.priority = "High";
    fallbackTriage.score = 85;
    fallbackTriage.summary = "Significant asphalt surface defect / pothole verified. 48-72h SLA dispatch for cold-mix patch repair.";
  }

  // If Gemini key is available, attempt multimodal enhancement with 3s timeout
  if (
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== "YOUR_GEMINI_KEY_HERE" &&
    process.env.GEMINI_API_KEY.trim().length > 10
  ) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const promptText = `Analyze this civic problem: "${description || "Photo evidence"}"
Return STRICT JSON ONLY:
{
  "category": "one of: Road Repair & Potholes, Street Lighting, Sanitation / Garbage Collection, Water Supply & Drainage, Footpath / Pavement, Encroachment, Park / Public Space, Stray Animals, Noise / Pollution, Other",
  "priority": "one of: Low, Medium, High, Urgent",
  "score": integer 1-100,
  "summary": "2 sentences describing defect"
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

      const result = await withTimeout(model.generateContent(parts), 3000);
      const responseText = result.response.text();
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return res.json(JSON.parse(jsonMatch[0]));
      }
    } catch (geminiErr) {
      console.warn("Gemini analyze skipped/timed out, using smart heuristic:", geminiErr.message);
    }
  }

  // Always return clean successful triage
  return res.json(fallbackTriage);
});

export default router;
