import {
  Award,
  Brain,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  Lightbulb,
  Shield,
  Sparkles,
  Star,
  TestTube2,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

// ─── Engineering Footer (shared) ──────────────────────────────────────────────
const ENG_METRICS = [
  { icon: Code2,      label: "Lines of Code",    value: "21,766" },
  { icon: TestTube2,  label: "Automated Tests",  value: "92" },
  { icon: Layers,     label: "Components",       value: "74" },
  { icon: Database,   label: "DB Tables",        value: "12" },
  { icon: Zap,        label: "API Endpoints",    value: "46" },
  { icon: Shield,     label: "QA Criteria",      value: "50" },
  { icon: FileText,   label: "Scenarios",        value: "16" },
  { icon: Brain,      label: "tRPC Routers",     value: "8" },
];

function EngineeringFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-indigo-600 uppercase mb-6">
          <span className="font-mono">&lt;/&gt;</span> Engineering
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 mb-8">
          {ENG_METRICS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <Icon size={16} className="mx-auto mb-1 text-gray-400" />
              <div className="text-lg font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 leading-tight">{label}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 border-t border-gray-200 pt-6">
          <span>Agent Forge — For internal training purposes only · Zero license cost</span>
          <span>
            For anything, feel free to reach out to{" "}
            <a href="mailto:das.samir4u@gmail.com" className="text-blue-600 hover:underline font-medium">
              Samir Das (das.samir4u@gmail.com)
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const OC1_INNOVATIONS = [
  {
    title: "Multi-Agent AI Architecture",
    desc: "Five autonomous AI agents with inter-agent communication and orchestration — a novel approach to training simulation that no existing commercial tool implements. The Simulation, Coaching, Evaluation, Planning, and Orchestrator agents operate independently and collaboratively.",
  },
  {
    title: "Adaptive Difficulty Engine",
    desc: "Real-time scenario complexity adjustment based on learner performance — dynamically modifying customer persona behaviour, emotional escalation, and technical complexity. No commercial tool offers this level of adaptive personalisation.",
  },
  {
    title: "Integrated Experimentation Sandbox",
    desc: "Combining a feature experimentation sandbox within a training platform is entirely novel — enabling organisations to test both training approaches AND product features in a unified environment. LaunchDarkly-style feature flags with 94% statistical confidence measurement.",
  },
  {
    title: "JTBD Framework Integration",
    desc: "Jobs-To-Be-Done methodology applied to training scenario design — a novel intersection of product strategy and learning technology not found in any existing platform. Scenarios are structured around learner jobs, not just topic categories.",
  },
];

const COST_COMPARISON = [
  { capability: "Application simulation",    tool: "Whatfix Mirror",      annual: "~$193K/year", agentForge: "Included (CRM replica)" },
  { capability: "AI roleplay",               tool: "Solidroad",           annual: "$60K/year",   agentForge: "Included (5 AI agents)" },
  { capability: "AI roleplay (advanced)",    tool: "Mindtickle",          annual: "~$94K/year",  agentForge: "Included (adaptive difficulty)" },
  { capability: "Content creation support",  tool: "Whatfix DAA Services", annual: "$50K/year",  agentForge: "Included (Creator Mode)" },
];

const AUTHORSHIP_TABLE = [
  { type: "Creator Attribution",   detail: "Samir Das — displayed in application footer across all pages" },
  { type: "Code Ownership",        detail: "21,766 lines of code written as sole developer" },
  { type: "Architecture Design",   detail: "5 autonomous AI agents + orchestrator — original design" },
  { type: "Database Schema",       detail: "12 tables designed and implemented independently" },
  { type: "Test Suite",            detail: "92 automated tests demonstrating engineering rigour" },
  { type: "Deployment",            detail: "67+ days continuous uptime, sole operator" },
  { type: "Domain Registration",   detail: "agentforge.org.uk — registered and maintained by Samir Das" },
  { type: "Live URL",              detail: "www.agentforge.org.uk — publicly accessible" },
];

const KEY_FEATURES = [
  {
    num: "1",
    title: "Full CRM Simulation Environment",
    desc: "Agent Forge includes a complete replica of Meta's Agent Connect CRM interface with 8 functional tabs (Chat, Email, Phone, Notes, Activity, Escalation, Files, Tasks). This enables agents to practice in an environment identical to their production workspace — the same capability that Whatfix Mirror provides at $578,325 for the enterprise licence.",
  },
  {
    num: "2",
    title: "AI Roleplay with Dynamic Personas",
    desc: "The Simulation Agent generates realistic customer conversations using persona-driven behaviour models. Each scenario includes configurable difficulty levels, emotional states, and escalation triggers. This replicates the core capability of Solidroad ($60,000/year) with the addition of adaptive difficulty — a feature Solidroad does not offer.",
  },
  {
    num: "3",
    title: "Automated QA Evaluation",
    desc: "The Evaluation Agent scores every training session against a 50-point QA rubric covering Communication, Process Adherence, Issue Identification, and Escalation Handling — the same four metrics used in Meta's production QA system. This provides immediate, objective feedback without requiring human QA reviewers.",
  },
  {
    num: "4",
    title: "Creator Mode",
    desc: "A no-code interface allowing subject matter experts to create new training scenarios without developer involvement. Includes scenario templates, persona builders, and rubric customisation. This addresses the content creation bottleneck that the Whatfix DAA Services SOW ($132,865) was specifically contracted to solve.",
  },
  {
    num: "5",
    title: "Feature Flags & A/B Experimentation",
    desc: "LaunchDarkly-style environment management with targeting rules and controlled experiments. Multi-environment flags (Development 15/15, Staging 8/15, Production 3/15) with progressive rollout and statistical confidence measurement (94% confidence on Co-Pilot test, 2,340 participants).",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GTVEvidence() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <div className="bg-[#1a2a4a] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/" className="text-blue-300 hover:text-white text-sm flex items-center gap-1 transition-colors">
              ← Back to Agent Forge
            </Link>
          </div>
          <div className="flex items-start justify-between gap-4 mt-3">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy size={28} className="text-yellow-400 flex-shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-bold">GTV Evidence — Agent Forge</h1>
              </div>
              <p className="text-blue-200 text-sm sm:text-base max-w-2xl">
                Technical evidence package for the UK Global Talent Visa (Exceptional Talent route) — Tech Nation endorsement submission. This page maps Agent Forge against each Optional Criterion with verifiable, publicly accessible evidence.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-2 flex-shrink-0">
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">Tech Nation</span>
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">Global Talent Visa</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-14">

        {/* ── Hackathon Recognition Banner ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
          <Star size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">Hackathon Recognition</p>
            <p className="text-sm text-amber-800">
              Agent Forge (alongside Learning Catalyst) was presented at <strong>Meta's Global Spring Hackathon 2026</strong> as a selected innovation, demonstrating internal recognition of the platform's technical merit and commercial potential.
            </p>
          </div>
        </div>

        {/* ── OC1 ── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded">OC1</span>
            <h2 className="text-xl font-bold text-gray-900">Original Innovation</h2>
          </div>
          <p className="text-gray-600 text-sm mb-6">
            Agent Forge introduces four distinct technical innovations not present in any existing commercial training platform. Each is independently verifiable in the live codebase at{" "}
            <a href="https://www.agentforge.org.uk" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
              www.agentforge.org.uk <ExternalLink size={12} />
            </a>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {OC1_INNOVATIONS.map((item) => (
              <div key={item.title} className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-3">
                  <Lightbulb size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OC2 ── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded">OC2</span>
            <h2 className="text-xl font-bold text-gray-900">Activities Beyond Primary Occupation</h2>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
            <p className="text-gray-700 text-sm leading-relaxed mb-4">
              Agent Forge was designed, built, and deployed entirely outside my Meta employment. It is registered under my personal domain (<strong>agentforge.org.uk</strong>), hosted on independent infrastructure, and publicly accessible. The <strong>21,766 lines of code</strong>, <strong>92 automated tests</strong>, and <strong>12-table database schema</strong> represent substantial independent engineering work beyond my day job.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Lines of Code", value: "21,766", icon: Code2 },
                { label: "Automated Tests", value: "92", icon: TestTube2 },
                { label: "DB Tables", value: "12", icon: Database },
                { label: "Days Uptime", value: "67+", icon: Globe },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white rounded-lg p-3 text-center border border-emerald-100">
                  <Icon size={16} className="mx-auto mb-1 text-emerald-600" />
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OC3 ── */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded">OC3</span>
            <h2 className="text-xl font-bold text-gray-900">Significant Contribution to the Field</h2>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              Agent Forge demonstrates that the <strong>$1.14M in enterprise tooling</strong> purchased by Meta as a result of my pilot work can be replicated and extended by a single developer at zero cost. This has significant implications for the broader digital learning technology sector — it proves that AI-powered training simulation is achievable without enterprise-scale budgets, potentially <strong>democratising access to capabilities previously available only to large organisations</strong>.
            </p>
          </div>

          {/* Cost Comparison Table */}
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            Cost Comparison — Commercial Equivalents
          </h3>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a2a4a] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-xs">Capability</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs">Enterprise Tool</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs">Annual Cost</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs">Agent Forge</th>
                </tr>
              </thead>
              <tbody>
                {COST_COMPARISON.map((row, i) => (
                  <tr key={row.capability} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-gray-900 text-xs">{row.capability}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.tool}</td>
                    <td className="px-4 py-3 text-red-600 font-semibold text-xs">{row.annual}</td>
                    <td className="px-4 py-3 text-emerald-700 font-semibold text-xs">{row.agentForge}</td>
                  </tr>
                ))}
                <tr className="bg-[#1a2a4a] text-white">
                  <td className="px-4 py-3 font-bold text-xs" colSpan={2}>Total annual cost</td>
                  <td className="px-4 py-3 font-bold text-xs text-red-300">~$397K/year</td>
                  <td className="px-4 py-3 font-bold text-xs text-emerald-300">£0</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            Commercial rationale: Solidroad, Whatfix, and comparable tools cost between £21,000 and £450,000 per year in licensing fees. Agent Forge replicates and extends their combined functionality at £0 licensing cost.
          </p>
        </section>

        {/* ── Key Features & Commercial Rationale ── */}
        <section>
          <div className="bg-[#1a2a4a] text-white rounded-t-xl px-6 py-4">
            <h2 className="text-lg font-bold">Key Features &amp; Commercial Rationale</h2>
            <p className="text-blue-200 text-xs mt-1">Platform capabilities that replicate and extend $1.14M in enterprise tooling at zero licensing cost</p>
          </div>
          <div className="border border-gray-200 border-t-0 rounded-b-xl divide-y divide-gray-100">
            {KEY_FEATURES.map((f) => (
              <div key={f.num} className="px-6 py-5">
                <h3 className="font-bold text-indigo-700 text-sm mb-2">
                  {f.num}. {f.title}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          {/* Commercial rationale callout */}
          <div className="mt-4 border-l-4 border-indigo-400 bg-indigo-50 px-5 py-4 rounded-r-xl">
            <p className="text-sm text-gray-800">
              <strong>Commercial rationale:</strong> Solidroad, Whatfix, and comparable tools cost between £21,000 and £450,000 per year in licensing fees. Agent Forge replicates and extends their combined functionality — AI roleplay (Solidroad), application simulation (Whatfix), and automated QA evaluation — at <strong>£0 licensing cost</strong>. The platform demonstrates that the applicant can not only evaluate and deploy enterprise tools, but independently architect equivalent or superior solutions.
            </p>
          </div>
        </section>

        {/* ── Platform Authorship ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Users size={20} className="text-gray-500" />
            Platform Authorship — Creator Attribution
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1a2a4a] text-white">
                  <th className="text-left px-4 py-3 font-semibold text-xs w-40">Evidence Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs">Detail</th>
                </tr>
              </thead>
              <tbody>
                {AUTHORSHIP_TABLE.map((row, i) => (
                  <tr key={row.type} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-gray-900 text-xs">{row.type}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Verification CTA ── */}
        <section className="bg-[#1a2a4a] rounded-2xl p-8 text-center text-white">
          <Award size={36} className="mx-auto mb-4 text-yellow-400" />
          <h2 className="text-xl font-bold mb-2">Verify Everything Live</h2>
          <p className="text-blue-200 text-sm mb-6 max-w-xl mx-auto">
            Every claim on this page is verifiable in the live platform. The full codebase, all 16 scenarios, the agentic dashboard, and the engineering metrics are publicly accessible without a login.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://www.agentforge.org.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-[#1a2a4a] font-semibold px-6 py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors"
            >
              <Globe size={16} />
              Visit www.agentforge.org.uk
            </a>
            <a
              href="mailto:das.samir4u@gmail.com"
              className="flex items-center gap-2 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-white/10 transition-colors"
            >
              Contact Samir Das
            </a>
          </div>
          <p className="text-blue-300 text-xs mt-4">End of GTV Evidence — Agent Forge Technical Summary</p>
        </section>

        {/* ── Verified Checklist ── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Evidence Checklist — Tech Nation Assessor</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Live platform accessible at www.agentforge.org.uk",
              "21,766 lines of TypeScript code — sole developer",
              "92 automated Vitest tests — engineering rigour",
              "12 database tables — independent schema design",
              "5 autonomous AI agents with orchestration",
              "50-criterion automated QA scoring system",
              "Multi-language support — 17 languages",
              "Video interview practice via Tavus CVI",
              "Feature flag experimentation sandbox",
              "Presented at Meta Global Spring Hackathon 2026",
              "Zero licensing cost vs £21K–£450K commercial alternatives",
              "Registered domain: agentforge.org.uk (Samir Das)",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3">
                <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </section>

      </div>

      <EngineeringFooter />
    </div>
  );
}
