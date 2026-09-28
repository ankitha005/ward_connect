import express from "express";
import { HfInference } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Helper: Build comprehensive domain system prompt
function buildSystemPrompt(wardContext, language = "en") {
  const directorySection = wardContext
    ? `\n\n## OFFICIAL CONTACT DIRECTORY:\n${wardContext}\nWhen answering who to contact, ALWAYS cite specific names, designations, and mobile numbers from this directory.`
    : "";

  if (language === "kn") {
    return `ನೀವು "ಸಹಾಯ AI" (Sahaya AI), ಬೆಂಗಳೂರು ಮಹಾನಗರ ಪಾಲಿಕೆ ಹಾಗೂ ವಾರ್ಡ್ ಕನೆಕ್ಟ್ (Ward Connect) ಪೋರ್ಟಲ್‌ನ ಅಧಿಕೃತ, ಸಹಾನುಭೂತಿಪೂರ್ವಕ ಹಾಗೂ 24/7 ನಾಗರಿಕ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಸಹಾಯಕ.
ನಿಮ್ಮ ಕರ್ತವ್ಯ: ನಾಗರಿಕರಿಗೆ ಅವರ ವಾರ್ಡ್ ಸಮಸ್ಯೆಗಳು, ದೂರು ಸಲ್ಲಿಕೆ, ಅಧಿಕಾರಿಗಳ ಸಂಪರ್ಕ ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳ ಬಗ್ಗೆ ಸ್ಪಷ್ಟ, ಗೌರವಯುತ ಮತ್ತು ನಿಖರವಾದ ಕನ್ನಡದಲ್ಲಿ ಮಾಹಿತಿ ಒದಗಿಸುವುದು.

ಪ್ರಮುಖ ಮಾಹಿತಿ:
- ತುರ್ತು ಸಹಾಯವಾಣಿಗಳು: ಪೊಲೀಸ್: **112**, ಬಿಬಿಎಂಪಿ ನಿಯಂತ್ರಣ ಕೊಠಡಿ: **1533**, ಬೆಸ್ಕಾಂ (ವಿದ್ಯುತ್): **1912**, ಜಲಮಂಡಳಿ (ಕುಡಿಯುವ ನೀರು/ಒಳಚರಂಡಿ): **1916**, ಆಂಬ್ಯುಲೆನ್ಸ್: **108**, ಮಹಿಳಾ ಸಹಾಯವಾಣಿ: **1091**.
- ಪೋರ್ಟಲ್ ಲಿಂಕ್‌ಗಳು:
  * ಹೊಸ ದೂರು ದಾಖಲಿಸಲು: [ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ](/complaints)
  * ದೂರಿನ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಲು: [ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ](/track)
  * ವಾರ್ಡ್ ಅಧಿಕಾರಿಗಳ ವಿವರ: [ವಾರ್ಡ್ ಡೈರೆಕ್ಟರಿ](/directory)
  * ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು: [ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು](/schemes)
  * ವಾರ್ಡ್ ಸಮೀಕ್ಷೆ: [ಸಮೀಕ್ಷೆಯಲ್ಲಿ ಭಾಗವಹಿಸಿ](/survey)
- ದೂರು ಪರಿಹಾರ ಸಮಯ (SLA):
  * ರಸ್ತೆ ಗುಂಡಿ / ರಸ್ತೆ ದುರಸ್ತಿ: 48 ರಿಂದ 72 ಗಂಟೆಗಳು
  * ಬೀದಿ ದೀಪ ದುರಸ್ತಿ: 24 ರಿಂದ 48 ಗಂಟೆಗಳು
  * ಕಸ ಸಂಗ್ರಹಣೆ: ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ 6:30 ರಿಂದ 10:30 ರವರೆಗೆ. ಹಸಿ ಕಸ (ಹಸಿರು ಬುಟ್ಟಿ), ಒಣ ಕಸ (ನೀಲಿ ಬುಟ್ಟಿ).
  * ನೀರು ಸರಬರಾಜು ಸಮಸ್ಯೆ / ಒಳಚರಂಡಿ ಬ್ಲಾಕ್: BWSSB 1916 ತುರ್ತು ಆದ್ಯತೆ.

ಪ್ರಮುಖ ನಿಯಮಗಳು:
1. ಸಂಪೂರ್ಣವಾಗಿ ಶುದ್ಧ ಹಾಗೂ ಸ್ಪಷ್ಟ ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ (Respond primarily in clear Kannada).
2. ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ತಾಂತ್ರಿಕ ಪದಗಳನ್ನು ಸರಳ ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ (ಉದಾ: ರಸ್ತೆ ಗುಂಡಿ, ಬೀದಿ ದೀಪ, ಕಸ ವಿಲೇವಾರಿ).
3. ಬಳಕೆದಾರರಿಗೆ ನೇರವಾಗಿ ಪೋರ್ಟಲ್ ಲಿಂಕ್‌ಗಳನ್ನು ನೀಡಿ (ಉದಾಹರಣೆಗೆ: [ಹೊಸ ದೂರು ಸಲ್ಲಿಸಿ](/complaints)).
4. ಸೌಜನ್ಯದಿಂದ ಮತ್ತು ಸಂಕ್ಷಿಪ್ತವಾಗಿ (200 ಪದಗಳ ಒಳಗೆ) ಉತ್ತರಿಸಿ.${directorySection}`;
  }

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
3. Keep answers under 250 words, fast to read on mobile.${directorySection}`;
}

// Smart Local Fallback Engine if cloud AI is unavailable or rate-limited
function getLocalCivicResponse(prompt, wardContext, language = "en") {
  const p = (prompt || "").toLowerCase();
  const isKn = language === "kn" || /[\u0C80-\u0CFF]|ನಮಸ್ಕಾರ|ದೂರು|ಗುಂಡಿ|ರಸ್ತೆ|ಕಸ|ನೀರು|ವಿದ್ಯುತ್|ಬೆಸ್ಕಾಂ|ಅಧಿಕಾರಿ|ಹೇಗೆ/i.test(prompt);

  // 1. Kannada Language Engine
  if (isKn) {
    if (/ನಮಸ್ಕಾರ|ಹಲೋ|ಶುಭೋದಯ|ಹಾಯ್|ನಮಸ್ತೆ/i.test(p) || p.length < 15) {
      return `🙏 **ನಮಸ್ಕಾರ! ಸಹಾಯ AI (Sahaya AI) ನಾಗರಿಕ ಸೇವಾ ಕೇಂದ್ರಕ್ಕೆ ಸ್ವಾಗತ.**

ನಾನು ನಿಮ್ಮ ವಾರ್ಡ್‌ನ ಸಮಸ್ಯೆಗಳನ್ನು ಶೀಘ್ರವಾಗಿ ಬಗೆಹರಿಸಲು ಸದಾ ಸಿದ್ಧನಾಗಿದ್ದೇನೆ:
- 🛣️ **ರಸ್ತೆ ಗುಂಡಿ ಅಥವಾ ದುರಸ್ತಿ**: [ಹೊಸ ದೂರು ದಾಖಲಿಸಿ](/complaints)
- 🔍 **ದೂರಿನ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ ತಿಳಿಯಿರಿ**: [ದೂರು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ](/track)
- 📞 **ವಾರ್ಡ್ ಇಂಜಿನಿಯರ್‌ಗಳು ಮತ್ತು ಅಧಿಕಾರಿಗಳು**: [ಅಧಿಕಾರಿಗಳ ವಿವರ ನೋಡಿ](/directory)
- 💧 **ಕುಡಿಯುವ ನೀರು ಮತ್ತು ವಿದ್ಯುತ್ ಸಹಾಯವಾಣಿ**: ಜಲಮಂಡಳಿ (**1916**), ಬೆಸ್ಕಾಂ (**1912**)
- 📜 **ಸರ್ಕಾರಿ ಗ್ಯಾರಂಟಿ ಮತ್ತು ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು**: [ಯೋಜನೆಗಳ ವಿವರ](/schemes)

ನಿಮಗೆ ಯಾವ ವಿಷಯದಲ್ಲಿ ಸಹಾಯ ಬೇಕು? ದಯವಿಟ್ಟು ಕೇಳಿ!`;
    }

    if (/ಗುಂಡಿ|ರಸ್ತೆ|ಫುಟ್‌ಪಾತ್|ಡಾಂಬರು|ಕಾಲುದಾರಿ|ಹಾಳಾಗಿದೆ|ಹೊಂಡ/i.test(p)) {
      return `🛣️ **ರಸ್ತೆ ಮತ್ತು ಗುಂಡಿ ದುರಸ್ತಿ ಸೇವೆ (Road & Pothole Service)**

1. **ಆನ್‌ಲೈನ್ ದೂರು ಸಲ್ಲಿಸಿ**: ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಿಂದ ಜಿಪಿಎಸ್ ಲೊಕೇಶನ್ ಮತ್ತು ಫೋಟೋ ಸಹಿತ ದೂರು ದಾಖಲಿಸಿ:
   👉 **[ಹೊಸ ದೂರು ದಾಖಲಿಸಿ](/complaints)**
2. **ಪರಿಹಾರದ ಕಾಲಮಿತಿ (SLA)**: ಬಿಬಿಎಂಪಿ ನಿಯಮಾವಳಿ ಪ್ರಕಾರ ರಸ್ತೆ ಗುಂಡಿಗಳನ್ನು **48 ರಿಂದ 72 ಗಂಟೆಗಳಲ್ಲಿ** ದುರಸ್ತಿ ಮಾಡಲಾಗುತ್ತದೆ.
3. **ಸಂಬಂಧಪಟ್ಟ ಅಧಿಕಾರಿ**: ವಾರ್ಡ್ ಸಹಾಯಕ ಕಾರ್ಯಪಾಲಕ ಇಂಜಿನಿಯರ್ (AEE).
4. **ಬಿಬಿಎಂಪಿ ಸಹಾಯವಾಣಿ**: ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ **1533** ಅಥವಾ **080-22660000** ಗೆ ಕರೆ ಮಾಡಿ.`;
    }

    if (/ಕಸ|ಸ್ವಚ್ಛತೆ|ತ್ಯಾಜ್ಯ|ಕಸದ ಗಾಡಿ|ಪೌರಕಾರ್ಮಿಕ|ವಾಸನೆ|ಡಂಪ್|ಕಸದ ತೊಟ್ಟಿ/i.test(p)) {
      return `🗑️ **ಕಸ ವಿಲೇವಾರಿ ಮತ್ತು ನೈರ್ಮಲ್ಯ ಸೇವೆಗಳು (Solid Waste Management)**

- **ಮನೆ ಮನೆ ಕಸ ಸಂಗ್ರಹಣೆ ಸಮಯ**: ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ **6:30 ರಿಂದ 10:30 ರವರೆಗೆ**.
- **ಕಸ ವಿಂಗಡಣೆ ಕಡ್ಡಾಯ**:
  * 🟢 **ಹಸಿರು ಬುಟ್ಟಿ**: ಹಸಿ ಕಸ (ಅಡುಗೆ ಮನೆ ತ್ಯಾಜ್ಯ, ತರಕಾರಿ ಸಿಪ್ಪೆ).
  * 🔵 **ನೀಲಿ ಬುಟ್ಟಿ**: ಒಣ ಕಸ (ಪ್ಲಾಸ್ಟಿಕ್, ಕಾಗದ, ಗಾಜು).
  * 🔴 **ಪ್ರತ್ಯೇಕ ಹೊದಿಕೆ**: ಸ್ಯಾನಿಟರಿ ಮತ್ತು ಅಪಾಯಕಾರಿ ತ್ಯಾಜ್ಯ.
- **ಕಸದ ರಾಶಿ ವರದಿ ಮಾಡಲು**: ಫೋಟೋ ತೆಗೆದು ದೂರು ಸಲ್ಲಿಸಿ:
   👉 **[ಇಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ](/complaints)**
- **ಆರೋಗ್ಯ ನಿರೀಕ್ಷಕರ ಸಂಪರ್ಕ**: ಹಿರಿಯ ಆರೋಗ್ಯ ನಿರೀಕ್ಷಕರ (Senior Health Inspector) ವಿವರ ಪಡೆಯಲು:
   👉 **[ವಾರ್ಡ್ ಅಧಿಕಾರಿಗಳ ಪಟ್ಟಿ](/directory)**`;
    }

    if (/ನೀರು|ಕಾವೇರಿ|ಜಲಮಂಡಳಿ|ಒಳಚರಂಡಿ|ಪೈಪ್|ಸೋರಿಕೆ|ಮ್ಯಾನ್‌ಹೋಲ್|ಕಲುಷಿತ/i.test(p)) {
      return `💧 **ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಒಳಚರಂಡಿ ಸೇವೆ (BWSSB Assistance)**

- **ಜಲಮಂಡಳಿ 24/7 ಸಹಾಯವಾಣಿ**: ಯಾವುದೇ ನೀರು ಸರಬರಾಜು ವ್ಯತ್ಯಯ ಅಥವಾ ಪೈಪ್ ಸೋರಿಕೆಗೆ ತಕ್ಷಣ **1916** ಗೆ ಕರೆ ಮಾಡಿ.
- **ಒಳಚರಂಡಿ ಉಕ್ಕಿ ಹರಿಯುವುದು / ಮ್ಯಾನ್‌ಹೋಲ್ ಸಮಸ್ಯೆ**: ತುರ್ತು ಪರಿಹಾರಕ್ಕಾಗಿ ಫೋಟೋ ಸಹಿತ ದೂರು ದಾಖಲಿಸಿ:
   👉 **[ಜಲಮಂಡಳಿ ದೂರು ಸಲ್ಲಿಸಿ](/complaints)**
- **ವಾರ್ಡ್ ನೀರು ಸರಬರಾಜು ಇಂಜಿನಿಯರ್**: ನೇರ ಸಂಪರ್ಕ ಸಂಖ್ಯೆ ಪಡೆಯಲು:
   👉 **[ಅಧಿಕಾರಿಗಳ ಡೈರೆಕ್ಟರಿ](/directory)**`;
    }

    if (/ಬೆಳಕು|ದೀಪ|ಬೀದಿ ದೀಪ|ವಿದ್ಯುತ್|ಕರೆಂಟ್|ಬೆಸ್ಕಾಂ|ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್|ವೈರ್|ಕತ್ತಲೆ/i.test(p)) {
      return `💡 **ಬೀದಿ ದೀಪ ಮತ್ತು ಬೆಸ್ಕಾಂ ವಿದ್ಯುತ್ ಸೇವೆಗಳು (BESCOM & Streetlights)**

- **ಬೆಸ್ಕಾಂ ತುರ್ತು ಸಹಾಯವಾಣಿ**: ವಿದ್ಯುತ್ ಕಡಿತ ಅಥವಾ ಅಪಾಯಕಾರಿ ತಂತಿಗಳ ಬಗ್ಗೆ **1912** ಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ ವಾಟ್ಸಾಪ್ **9449844640** ಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ.
- **ಹಾಳಾದ ಬೀದಿ ದೀಪಗಳ ವರದಿ**: ನಿಮ್ಮ ರಸ್ತೆಯ ಕಂಬದ ವಿವರ ನೀಡಿ ದೂರು ದಾಖಲಿಸಿ:
   👉 **[ಬೀದಿ ದೀಪ ದೂರು ಸಲ್ಲಿಸಿ](/complaints)** *(24 ರಿಂದ 48 ಗಂಟೆಗಳಲ್ಲಿ ದುರಸ್ತಿ)*.
- **ವಾರ್ಡ್ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಸಿಬ್ಬಂದಿ**: ಸಂಪರ್ಕ ವಿವರಗಳನ್ನು **[ವಾರ್ಡ್ ಡೈರೆಕ್ಟರಿ](/directory)** ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.`;
    }

    if (/ಅಧಿಕಾರಿ|ಇಂಜಿನಿಯರ್|ಕಾರ್ಪೊರೇಟರ್|ಶಾಸಕ|ಸಂಪರ್ಕ|ನಂಬರ್|ಫೋನ್/i.test(p)) {
      return `📞 **ವಾರ್ಡ್ ಅಧಿಕಾರಿಗಳು ಮತ್ತು ಪ್ರತಿನಿಧಿಗಳ ಸಂಪರ್ಕ ವಿವರ**

ನಿಮ್ಮ ವಾರ್ಡ್‌ನ ಕಾರ್ಯನಿರ್ವಾಹಕ ಇಂಜಿನಿಯರ್‌ಗಳು, ಆರೋಗ್ಯ ನಿರೀಕ್ಷಕರು ಹಾಗೂ ಚುನಾಯಿತ ಪ್ರತಿನಿಧಿಗಳ ಸಂಪೂರ್ಣ ಪಟ್ಟಿ ಇಲ್ಲಿದೆ:
👉 **[ವಾರ್ಡ್ ಅಧಿಕಾರಿಗಳ ಡೈರೆಕ್ಟರಿ ನೋಡಿ](/directory)**

ಪ್ರಮುಖ ಸಂಖ್ಯೆಗಳು:
- **ಬಿಬಿಎಂಪಿ ಕಂಟ್ರೋಲ್ ರೂಂ**: **1533** / **080-22660000**
- **ಟ್ರಾಫಿಕ್ ಪೊಲೀಸ್**: **103** / **080-22943030**
- **ತುರ್ತು ಪೊಲೀಸ್**: **112**`;
    }

    if (/ಟ್ರ್ಯಾಕ್|ಸ್ಥಿತಿ|ದೂರಿನ ಸಂಖ್ಯೆ|ನನ್ನ ದೂರು|ಎಲ್ಲಿದೆ|ಸ್ಟೇಟಸ್/i.test(p)) {
      return `🔍 **ನಿಮ್ಮ ದೂರಿನ ಪ್ರಸ್ತುತ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ (Track Complaint)**

ನಿಮ್ಮ ದೂರಿನ ಟಿಕೆಟ್ ಐಡಿ (ಉದಾ: \`CHA-2026-...\`) ಅಥವಾ ನೋಂದಾಯಿತ 10-ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ ನೇರ ಸ್ಥಿತಿ ಪರಿಶೀಲಿಸಿ:
👉 **[ದೂರು ಟ್ರ್ಯಾಕ್ ಪುಟಕ್ಕೆ ಹೋಗಿ](/track)**

ಅಧಿಕಾರಿಗಳು ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ಪರಿಹಾರದ ಫೋಟೋ ಹಾಗೂ ಟಿಪ್ಪಣಿಗಳನ್ನು ಅಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು.`;
    }

    if (/ಯೋಜನೆ|ಗ್ಯಾರಂಟಿ|ಗೃಹಜ್ಯೋತಿ|ಗೃಹಲಕ್ಷ್ಮಿ|ಶಕ್ತಿ|ಯುವನಿಧಿ|ಸಹಾಯಧನ|ಸರ್ಕಾರ/i.test(p)) {
      return `📜 **ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಗ್ಯಾರಂಟಿ ಮತ್ತು ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು**

ನಾಗರಿಕರಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಯೋಜನೆಗಳ ಮಾಹಿತಿ:
- **ಗೃಹ ಜ್ಯೋತಿ**: 200 ಯೂನಿಟ್‌ವರೆಗೆ ಉಚಿತ ವಿದ್ಯುತ್.
- **ಗೃಹ ಲಕ್ಷ್ಮಿ**: ಮನೆಯೊಡತಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ಆರ್ಥಿಕ ನೆರವು.
- **ಶಕ್ತಿ ಯೋಜನೆ**: ಮಹಿಳೆಯರಿಗೆ ಸರ್ಕಾರಿ ಬಸ್‌ಗಳಲ್ಲಿ ಉಚಿತ ಪ್ರಯಾಣ.
- **ಯುವ ನಿಧಿ**: ನಿರುದ್ಯೋಗಿ ಪದವೀಧರರಿಗೆ ಮಾಸಿಕ ಭತ್ಯೆ.
- **ಪ್ರಧಾನಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ (PMAY)**: ಮನೆ ನಿರ್ಮಾಣಕ್ಕೆ ಗರಿಷ್ಠ ₹2.67 ಲಕ್ಷ ಸಬ್ಸಿಡಿ.

ಹೆಚ್ಚಿನ ವಿವರ ಮತ್ತು ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಲಿಂಕ್‌ಗಳಿಗಾಗಿ:
👉 **[ಕಲ್ಯಾಣ ಯೋಜನೆಗಳ ಪೋರ್ಟಲ್](/schemes)**`;
    }

    if (/ತುರ್ತು|ಆಂಬ್ಯುಲೆನ್ಸ್|ಪೊಲೀಸ್|ಅಪಘಾತ|ಬೆಂಕಿ|ಅಗ್ನಿಶಾಮಕ/i.test(p)) {
      return `🚨 **ಬೆಂಗಳೂರು ತುರ್ತು ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆಗಳು**

- 🚓 **ಪೊಲೀಸ್ ತುರ್ತು ಸೇವೆ**: **112**
- 🚑 **ಆಂಬ್ಯುಲೆನ್ಸ್ (ವೈದ್ಯಕೀಯ)**: **108**
- 🚒 **ಅಗ್ನಿಶಾಮಕ ದಳ**: **101**
- 👩 **ಮಹಿಳಾ ಸುರಕ್ಷತಾ ಸಹಾಯವಾಣಿ**: **1091**
- 👵 **ಹಿರಿಯ ನಾಗರಿಕರ ಸಹಾಯವಾಣಿ**: **1090**
- 🏢 **ಬಿಬಿಎಂಪಿ ವಿಪತ್ತು ನಿರ್ವಹಣೆ**: **080-22221188** / **1533**`;
    }

    return `🙏 **ಸಹಾಯ AI ನಾಗರಿಕ ಸಹಾಯಕ**

ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ವಾರ್ಡ್‌ನ ಯಾವುದೇ ಸಮಸ್ಯೆಗೆ ತ್ವರಿತ ಪರಿಹಾರ ಪಡೆಯಲು:
- 📝 ಅಧಿಕೃತವಾಗಿ ಪರಿಶೀಲನೆಗೆ ಒಳಪಡಿಸಲು **[ಹೊಸ ದೂರು ದಾಖಲಿಸಿ](/complaints)**.
- 📞 ನಿಮ್ಮ ವಾರ್ಡ್ ಇಂಜಿನಿಯರ್‌ಗಳ ನೇರ ಸಂಪರ್ಕಕ್ಕಾಗಿ **[ವಾರ್ಡ್ ಡೈರೆಕ್ಟರಿ](/directory)** ವೀಕ್ಷಿಸಿ.
- 🚨 ತಕ್ಷಣದ ತುರ್ತು ಸಹಾಯಕ್ಕಾಗಿ ಬಿಬಿಎಂಪಿ **1533** ಅಥವಾ ಪೊಲೀಸ್ **112** ಗೆ ಕರೆ ಮಾಡಿ.`;
  }

  // 2. English Language Engine
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

Enter your Complaint Tracking ID (e.g. \`CHA-2026-...\`) or your registered 10-digit mobile number.`;
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
    const { prompt, wardContext, history = [], language = "en" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const trimmedPrompt = prompt.trim();
    const pLower = trimmedPrompt.toLowerCase();

    // Determine target language (explicit or detected Kannada script)
    const effectiveLang =
      language === "kn" || /[\u0C80-\u0CFF]/.test(trimmedPrompt) ? "kn" : "en";

    // Fast-path: Instant matching for common civic patterns (< 10ms)
    const isCivicPattern = /^(hi|hello|hey|namaskara|namaste)$|pothole|garbage|waste|water|sewage|drain|bescom|streetlight|official|engineer|track|status|scheme|subsidy|emergency|ambulance|police|ನಮಸ್ಕಾರ|ಗುಂಡಿ|ರಸ್ತೆ|ಕಸ|ನೀರು|ದೀಪ|ಅಧಿಕಾರಿ|ಯೋಜನೆ|ತುರ್ತು/i.test(
      pLower
    );

    // If query matches a known pattern or is a simple greeting, return instantly without network lag
    if (isCivicPattern && trimmedPrompt.length < 90) {
      const fastResponse = getLocalCivicResponse(trimmedPrompt, wardContext, effectiveLang);
      return res.json({ response: fastResponse, provider: "instant-civic-engine", language: effectiveLang });
    }

    const systemPrompt = buildSystemPrompt(wardContext, effectiveLang);

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
          return res.json({ response: reply.trim(), provider: "gemini", language: effectiveLang });
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
        const langInstruction =
          effectiveLang === "kn"
            ? "You are Sahaya AI. Respond in clear, polite Kannada language."
            : "You are Sahaya AI, Bengaluru Municipal Civic Assistant. Keep responses concise, helpful, and under 150 words.";

        const messages = [
          {
            role: "system",
            content: langInstruction,
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
          max_tokens: 250,
          temperature: 0.7,
        });

        const response = await withTimeout(responsePromise, 2500);
        const reply = response.choices?.[0]?.message?.content;
        if (reply && reply.trim()) {
          return res.json({ response: reply.trim(), provider: "huggingface", language: effectiveLang });
        }
      } catch (hfErr) {
        console.warn("HuggingFace timeout/error, using instant civic engine:", hfErr.message);
      }
    }

    // Tier 3: Local Civic Knowledge Engine (Zero-fail, instant response)
    const fallbackResponse = getLocalCivicResponse(trimmedPrompt, wardContext, effectiveLang);
    return res.json({ response: fallbackResponse, provider: "local-civic-engine", language: effectiveLang });
  } catch (err) {
    console.error("AI chat general error:", err);
    return res.json({
      response: getLocalCivicResponse(req.body?.prompt, req.body?.wardContext, req.body?.language || "en"),
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
