/**
 * Certificate generator — produces a styled HTML string that the client
 * renders in a hidden <iframe> and prints/saves as PDF, OR we generate
 * it server-side as a base64-encoded SVG/HTML blob returned to the client.
 *
 * We use a pure SVG approach so there are zero npm dependencies and it
 * works in the Cloud Run environment without Puppeteer or headless Chrome.
 */

export interface CertificateData {
  learnerName: string;
  scenarioTitle: string;
  category: string;
  difficulty: string;
  overallScore: number;
  date: string; // ISO date string
  language?: string | null;
}

const SCORE_COLOR = (score: number) =>
  score >= 85 ? "#16a34a" : score >= 70 ? "#d97706" : "#dc2626";

const SCORE_LABEL = (score: number) =>
  score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 55 ? "Fair" : "Needs Work";

const CAT_LABEL: Record<string, string> = {
  sales: "Sales",
  customer_service: "Customer Service",
  interview: "Interview",
  negotiation: "Negotiation",
  presentation: "Presentation",
};

/**
 * Returns a self-contained HTML page string that renders a printable
 * A4-landscape certificate. The client opens it in a new tab or iframe.
 */
export function buildCertificateHtml(data: CertificateData): string {
  const {
    learnerName,
    scenarioTitle,
    category,
    difficulty,
    overallScore,
    date,
    language,
  } = data;

  const scoreColor = SCORE_COLOR(overallScore);
  const scoreLabel = SCORE_LABEL(overallScore);
  const catLabel = CAT_LABEL[category] ?? category;
  const diffLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const langNote = language && language !== "en"
    ? `<div class="lang-badge">Conducted in ${LANG_NAMES[language] ?? language}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Certificate — ${scenarioTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 297mm; height: 210mm; background: #fff; font-family: 'Inter', sans-serif; }
  .page {
    width: 297mm; height: 210mm;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 16mm 20mm;
    background: linear-gradient(135deg, #f8f7ff 0%, #ffffff 50%, #f0f4ff 100%);
    position: relative; overflow: hidden;
  }
  /* decorative corner accents */
  .corner { position: absolute; width: 60mm; height: 60mm; }
  .corner.tl { top: 0; left: 0; border-top: 6px solid #6366f1; border-left: 6px solid #6366f1; border-radius: 0 0 40px 0; }
  .corner.tr { top: 0; right: 0; border-top: 6px solid #6366f1; border-right: 6px solid #6366f1; border-radius: 0 0 0 40px; }
  .corner.bl { bottom: 0; left: 0; border-bottom: 6px solid #6366f1; border-left: 6px solid #6366f1; border-radius: 0 40px 0 0; }
  .corner.br { bottom: 0; right: 0; border-bottom: 6px solid #6366f1; border-right: 6px solid #6366f1; border-radius: 40px 0 0 0; }
  /* watermark circle */
  .watermark {
    position: absolute; width: 180mm; height: 180mm; border-radius: 50%;
    border: 1px solid rgba(99,102,241,0.08);
    top: 50%; left: 50%; transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 6mm; }
  .brand-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: 900; font-size: 18px;
  }
  .brand-name { font-size: 18px; font-weight: 700; color: #3730a3; letter-spacing: -0.3px; }
  .cert-label {
    font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
    color: #6366f1; margin-bottom: 4mm;
  }
  .cert-title {
    font-size: 28px; font-weight: 900; color: #1e1b4b; text-align: center;
    line-height: 1.15; margin-bottom: 3mm;
  }
  .cert-subtitle {
    font-size: 13px; color: #64748b; margin-bottom: 7mm; text-align: center;
  }
  .learner-name {
    font-size: 38px; font-weight: 900; color: #1e1b4b;
    border-bottom: 3px solid #6366f1; padding-bottom: 2mm; margin-bottom: 7mm;
    text-align: center; letter-spacing: -0.5px;
  }
  .scenario-box {
    background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15);
    border-radius: 12px; padding: 4mm 8mm; margin-bottom: 6mm; text-align: center;
  }
  .scenario-label { font-size: 9px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #6366f1; margin-bottom: 1mm; }
  .scenario-title { font-size: 15px; font-weight: 700; color: #1e1b4b; }
  .meta-row { display: flex; gap: 6mm; align-items: center; margin-bottom: 6mm; flex-wrap: wrap; justify-content: center; }
  .meta-chip {
    background: #f1f5f9; border-radius: 20px; padding: 2mm 4mm;
    font-size: 10px; font-weight: 600; color: #475569;
  }
  .score-row { display: flex; align-items: center; gap: 4mm; margin-bottom: 6mm; }
  .score-circle {
    width: 22mm; height: 22mm; border-radius: 50%;
    border: 4px solid ${scoreColor};
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .score-num { font-size: 22px; font-weight: 900; color: ${scoreColor}; line-height: 1; }
  .score-denom { font-size: 9px; color: #94a3b8; }
  .score-label-text { font-size: 13px; font-weight: 700; color: ${scoreColor}; }
  .lang-badge {
    background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2);
    border-radius: 20px; padding: 1.5mm 4mm;
    font-size: 10px; font-weight: 600; color: #6366f1; margin-bottom: 4mm;
  }
  .footer-row {
    position: absolute; bottom: 8mm; left: 20mm; right: 20mm;
    display: flex; justify-content: space-between; align-items: flex-end;
  }
  .footer-sig { text-align: center; }
  .footer-sig-line { width: 40mm; border-top: 1.5px solid #cbd5e1; margin-bottom: 1.5mm; }
  .footer-sig-name { font-size: 10px; font-weight: 700; color: #1e1b4b; }
  .footer-sig-title { font-size: 9px; color: #94a3b8; }
  .footer-date { font-size: 10px; color: #94a3b8; text-align: right; }
  @media print {
    html, body { width: 297mm; height: 210mm; }
    .page { page-break-after: avoid; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>
  <div class="watermark"></div>

  <div class="brand">
    <div class="brand-icon">A</div>
    <span class="brand-name">Agent Forge</span>
  </div>

  <div class="cert-label">Certificate of Completion</div>

  <div class="cert-title">This is to certify that</div>
  <div class="learner-name">${escapeHtml(learnerName)}</div>
  <div class="cert-subtitle">has successfully completed the following AI-powered training simulation</div>

  <div class="scenario-box">
    <div class="scenario-label">Scenario</div>
    <div class="scenario-title">${escapeHtml(scenarioTitle)}</div>
  </div>

  ${langNote}

  <div class="meta-row">
    <span class="meta-chip">📂 ${catLabel}</span>
    <span class="meta-chip">⚡ ${diffLabel}</span>
    <span class="meta-chip">📅 ${formattedDate}</span>
  </div>

  <div class="score-row">
    <div class="score-circle">
      <span class="score-num">${Math.round(overallScore)}</span>
      <span class="score-denom">/ 100</span>
    </div>
    <div>
      <div style="font-size:10px;color:#94a3b8;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:1mm;">Performance Score</div>
      <div class="score-label-text">${scoreLabel}</div>
    </div>
  </div>

  <div class="footer-row">
    <div class="footer-sig">
      <div class="footer-sig-line"></div>
      <div class="footer-sig-name">Samir Das</div>
      <div class="footer-sig-title">Creator, Agent Forge · das.samir4u@gmail.com</div>
    </div>
    <div class="footer-date">Issued: ${formattedDate}<br/>agentforge.org.uk</div>
  </div>
</div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const LANG_NAMES: Record<string, string> = {
  fr: "French", es: "Spanish", ar: "Arabic", zh: "Mandarin Chinese",
  de: "German", pt: "Portuguese", it: "Italian", ja: "Japanese", ko: "Korean",
  hi: "Hindi", nl: "Dutch", tr: "Turkish", pl: "Polish", sv: "Swedish",
  bn: "Bengali", sw: "Swahili",
};
