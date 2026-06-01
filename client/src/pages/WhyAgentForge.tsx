import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Check, X, Minus, Crown, DollarSign, ShieldAlert, Lock, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

type FeatureValue = "yes" | "no" | "partial";

interface FeatureRow {
  label: string;
  agentForge: FeatureValue;
  secondNature: FeatureValue;
  solidroad: FeatureValue;
  mindtickle: FeatureValue;
  whatfix: FeatureValue;
  walkme: FeatureValue;
}

interface FeatureGroup {
  category: string;
  rows: FeatureRow[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    category: "CORE",
    rows: [
      { label: "AI Customer Simulation",          agentForge: "yes", secondNature: "yes",     solidroad: "yes",     mindtickle: "partial", whatfix: "no",      walkme: "no" },
      { label: "CRM Replica Environment",          agentForge: "yes", secondNature: "no",      solidroad: "no",      mindtickle: "no",      whatfix: "partial", walkme: "partial" },
      { label: "Diagnostic Tool Views (UBD/IDD)",  agentForge: "yes", secondNature: "no",      solidroad: "no",      mindtickle: "no",      whatfix: "no",      walkme: "no" },
    ],
  },
  {
    category: "QUALITY",
    rows: [
      { label: "Automated QA Scoring (50 criteria)", agentForge: "yes", secondNature: "partial", solidroad: "partial", mindtickle: "yes",     whatfix: "no",      walkme: "no" },
      { label: "No-Code Scenario Builder",            agentForge: "yes", secondNature: "partial", solidroad: "yes",     mindtickle: "yes",     whatfix: "partial", walkme: "partial" },
      { label: "AI Screenshot Anonymization",         agentForge: "yes", secondNature: "no",      solidroad: "no",      mindtickle: "no",      whatfix: "no",      walkme: "no" },
    ],
  },
  {
    category: "SCALE",
    rows: [
      { label: "Multi-Program Architecture", agentForge: "yes", secondNature: "partial", solidroad: "partial", mindtickle: "yes",     whatfix: "partial", walkme: "partial" },
      { label: "Role-Based Access Control",  agentForge: "yes", secondNature: "partial", solidroad: "yes",     mindtickle: "yes",     whatfix: "yes",     walkme: "yes" },
      { label: "Unlimited Users",            agentForge: "yes", secondNature: "no",      solidroad: "no",      mindtickle: "no",      whatfix: "no",      walkme: "no" },
      { label: "Unlimited AI Sessions",      agentForge: "yes", secondNature: "no",      solidroad: "no",      mindtickle: "partial", whatfix: "partial", walkme: "partial" },
    ],
  },
  {
    category: "SECURITY",
    rows: [
      { label: "Full Data Ownership",        agentForge: "yes", secondNature: "no",  solidroad: "no",  mindtickle: "no",  whatfix: "no",  walkme: "no" },
      { label: "No Vendor Lock-in",          agentForge: "yes", secondNature: "no",  solidroad: "no",  mindtickle: "no",  whatfix: "no",  walkme: "no" },
      { label: "Native Meta Workflow Fit",   agentForge: "yes", secondNature: "no",  solidroad: "no",  mindtickle: "no",  whatfix: "no",  walkme: "no" },
      { label: "Fully Customizable",         agentForge: "yes", secondNature: "partial", solidroad: "partial", mindtickle: "partial", whatfix: "partial", walkme: "partial" },
    ],
  },
];

const COMPETITORS = [
  { key: "agentForge",   name: "Agent Forge",   tagline: "Built in-house. Zero license." },
  { key: "secondNature", name: "Second Nature",  tagline: "AI role-play for sales" },
  { key: "solidroad",    name: "Solidroad",      tagline: "AI training with QA" },
  { key: "mindtickle",   name: "Mindtickle",     tagline: "Sales readiness platform" },
  { key: "whatfix",      name: "Whatfix",        tagline: "Digital adoption platform" },
  { key: "walkme",       name: "WalkMe",         tagline: "Digital adoption platform" },
];

function scoreFor(key: string, groups: FeatureGroup[]): string {
  if (key === "agentForge") return "14/14";
  let yes = 0;
  let total = 0;
  for (const g of groups) {
    for (const r of g.rows) {
      total++;
      const val = r[key as keyof FeatureRow] as FeatureValue;
      if (val === "yes") yes += 1;
      else if (val === "partial") yes += 0.25;
    }
  }
  return `${yes}/${total}`;
}

function FeatureIcon({ value }: { value: FeatureValue }) {
  if (value === "yes")     return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === "no")      return <X     className="w-4 h-4 text-red-400 mx-auto" />;
  return <Minus className="w-4 h-4 text-amber-400 mx-auto" />;
}

// ─── Pricing Data ─────────────────────────────────────────────────────────────

interface PricingCard {
  name: string;
  tagline: string;
  perUser: string;
  annual: string;
  tco3yr: string;
  note: string;
  source: string;
  highlight?: boolean;
  annualRed?: boolean;
  tcoRed?: boolean;
}

const PRICING_CARDS: PricingCard[] = [
  {
    name: "Agent Forge",
    tagline: "Built in-house. Zero license.",
    perUser: "$0",
    annual: "$0",
    tco3yr: "$0",
    note: "No per-user or per-session fees",
    source: "Source: internal",
    highlight: true,
  },
  {
    name: "Second Nature",
    tagline: "AI role-play for sales",
    perUser: "$55–65/user/mo",
    annual: "$5K–$20K+",
    tco3yr: "$15K–$60K+",
    note: "Starter: $99/mo (5 users, 50 sessions)",
    source: "Source: salesroleplay.app, kendo.ai",
    annualRed: true,
    tcoRed: true,
  },
  {
    name: "Solidroad",
    tagline: "AI training with QA",
    perUser: "$10–50/user/mo",
    annual: "$2.4K–$6K+",
    tco3yr: "$7.2K–$18K+",
    note: "Growth: $199/mo (up to 50 users)",
    source: "Source: saasworthy.com, sourceforge.net",
    annualRed: true,
    tcoRed: true,
  },
  {
    name: "Mindtickle",
    tagline: "Sales readiness platform",
    perUser: "$15–50/user/mo",
    annual: "~$92K",
    tco3yr: "~$276K",
    note: "Avg contract: ~$92K/yr (Vendr)",
    source: "Source: vendr.com, capterra.com",
    annualRed: true,
    tcoRed: true,
  },
  {
    name: "Whatfix",
    tagline: "Digital adoption platform",
    perUser: "~$2K/mo",
    annual: "~$32K",
    tco3yr: "~$96K",
    note: "Avg annual: ~$32K/yr (Vendr)",
    source: "Source: userpilot.com, producktly.com",
    annualRed: true,
    tcoRed: true,
  },
  {
    name: "WalkMe",
    tagline: "Digital adoption platform",
    perUser: "~$6.5K/mo",
    annual: "~$79K",
    tco3yr: "~$237K",
    note: "Avg annual: ~$79K/yr (Vendr)",
    source: "Source: userpilot.com, glitter.io",
    annualRed: true,
    tcoRed: true,
  },
];

const HIDDEN_COSTS = [
  { icon: DollarSign, title: "Annual Renewal Risk",   desc: "10–20% price increases per year are standard in SaaS contracts" },
  { icon: Lock,       title: "Vendor Lock-in",         desc: "Migrating scenarios, data, and workflows to a new vendor costs months of effort" },
  { icon: Users,      title: "Per-Seat Scaling",       desc: "Adding 100 trainees at $50/seat = $60K/year in additional fees" },
  { icon: Zap,        title: "Integration Overhead",   desc: "Custom API integrations with internal tools require vendor professional services" },
];

// ─── Engineering Footer ───────────────────────────────────────────────────────
const ENG_METRICS = [
  { label: "Lines of Code",   value: "21,766" },
  { label: "Automated Tests", value: "92" },
  { label: "Components",      value: "74" },
  { label: "DB Tables",       value: "8" },
  { label: "API Endpoints",   value: "46" },
  { label: "QA Criteria",     value: "50" },
  { label: "Scenarios",       value: "16" },
  { label: "tRPC Routers",    value: "7" },
];

function EngineeringFooter() {
  return (
    <div className="mt-12 border-t border-gray-200 pt-6 pb-4">
      <div className="flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
        <span className="font-mono">&lt;/&gt;</span> Engineering
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 text-center">
        {ENG_METRICS.map((m) => (
          <div key={m.label} className="flex flex-col items-center gap-1">
            <span className="text-xl font-bold text-gray-900">{m.value}</span>
            <span className="text-xs text-gray-500">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-400">
        <span>Agent Forge — For internal training purposes only · Zero license cost</span>
        <span>
          For anything, feel free to reach out to{" "}
          <a href="mailto:das.samir4u@gmail.com" className="text-blue-600 hover:underline font-medium">
            Samir Das (das.samir4u@gmail.com)
          </a>
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type Tab = "features" | "pricing";

export default function WhyAgentForge() {
  const [tab, setTab] = useState<Tab>("features");

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="bg-[#1a3a8f] text-white px-4 sm:px-8 py-5">
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4 w-fit">
          <ArrowLeft className="w-4 h-4" />
          Back to Agent Forge
        </Link>
        <div className="flex items-start sm:items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-400" />
              <h1 className="text-2xl font-bold">Why Agent Forge?</h1>
            </div>
            <p className="text-blue-200 text-sm max-w-lg">
              See how Agent Forge compares to commercial simulation and training tools. Zero license cost, full
              feature parity, and built specifically for enterprise support workflows.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("features")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                tab === "features"
                  ? "bg-white text-[#1a3a8f] border-white"
                  : "bg-transparent text-white border-white/40 hover:border-white"
              )}
            >
              Features
            </button>
            <button
              onClick={() => setTab("pricing")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold border transition-all",
                tab === "pricing"
                  ? "bg-white text-[#1a3a8f] border-white"
                  : "bg-transparent text-white border-white/40 hover:border-white"
              )}
            >
              Pricing &amp; TCO
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── Features Tab ────────────────────────────────────────────────── */}
        {tab === "features" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 pr-4 font-semibold text-gray-700 w-48">Feature</th>
                  {COMPETITORS.map((c) => (
                    <th
                      key={c.key}
                      className={cn(
                        "text-center py-3 px-3 font-semibold",
                        c.key === "agentForge"
                          ? "text-blue-600 bg-blue-50 rounded-t-lg"
                          : "text-gray-700"
                      )}
                    >
                      <div className={cn("font-bold", c.key === "agentForge" ? "text-blue-700" : "text-gray-800")}>
                        {c.name}
                      </div>
                      <div className="text-[10px] font-normal text-gray-400 mt-0.5">{c.tagline}</div>
                    </th>
                  ))}
                </tr>
                {/* Blue underline for Agent Forge column */}
                <tr>
                  <td />
                  {COMPETITORS.map((c) => (
                    <td key={c.key} className={cn("pb-1", c.key === "agentForge" ? "bg-blue-50" : "")}>
                      {c.key === "agentForge" && <div className="h-0.5 bg-blue-600 mx-3 rounded-full" />}
                    </td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_GROUPS.map((group) => (
                  <>
                    {/* Category header */}
                    <tr key={group.category}>
                      <td colSpan={7} className="pt-5 pb-1 px-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                          {group.category}
                        </span>
                      </td>
                    </tr>
                    {group.rows.map((row, ri) => (
                      <tr
                        key={row.label}
                        className={cn(
                          "border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
                          ri % 2 === 0 ? "" : ""
                        )}
                      >
                        <td className="py-3 pr-4 text-gray-700 text-xs">{row.label}</td>
                        {COMPETITORS.map((c) => (
                          <td
                            key={c.key}
                            className={cn(
                              "text-center py-3 px-3",
                              c.key === "agentForge" ? "bg-blue-50/60" : ""
                            )}
                          >
                            <FeatureIcon value={row[c.key as keyof FeatureRow] as FeatureValue} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))}

                {/* Score row */}
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-4 pr-4 text-sm text-gray-800">Feature Score</td>
                  {COMPETITORS.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        "text-center py-4 px-3 text-sm",
                        c.key === "agentForge"
                          ? "text-blue-600 bg-blue-50/60 font-extrabold text-base"
                          : "text-gray-600"
                      )}
                    >
                      {scoreFor(c.key, FEATURE_GROUPS)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pricing & TCO Tab ────────────────────────────────────────────── */}
        {tab === "pricing" && (
          <div>
            {/* Pricing cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {PRICING_CARDS.map((card) => (
                <div
                  key={card.name}
                  className={cn(
                    "rounded-xl border p-5 flex flex-col gap-3",
                    card.highlight
                      ? "border-blue-400 border-2 bg-white shadow-md"
                      : "border-gray-200 bg-white"
                  )}
                >
                  {card.highlight && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full w-fit uppercase tracking-wider">
                      Zero Cost
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{card.name}</p>
                      <p className="text-xs text-gray-400">{card.tagline}</p>
                    </div>
                    <DollarSign className={cn("w-5 h-5 flex-shrink-0", card.highlight ? "text-blue-500" : "text-red-400")} />
                  </div>

                  <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
                    {[
                      { label: "PER-USER PRICE", value: card.perUser, red: false },
                      { label: "ANNUAL COST",    value: card.annual,  red: card.annualRed },
                      { label: "3-YEAR TCO",     value: card.tco3yr,  red: card.tcoRed },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-gray-400 uppercase tracking-wider text-[10px] font-semibold">{row.label}</span>
                        <span className={cn("font-bold", row.red ? "text-red-500" : "text-emerald-600")}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <p className="text-[10px] text-gray-500">{card.note}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 italic">{card.source}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden Costs */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-amber-800">Hidden Costs of Commercial Tools</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {HIDDEN_COSTS.map((hc) => {
                  const Icon = hc.icon;
                  return (
                    <div key={hc.title} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-800">{hc.title}</p>
                        <p className="text-[11px] text-amber-700 mt-0.5">{hc.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Savings CTA */}
            <div className="bg-[#1a3a8f] rounded-xl p-8 text-center text-white">
              <h2 className="text-xl font-bold mb-2">Save $96K–$276K over 3 years</h2>
              <p className="text-blue-200 text-sm mb-6">
                Agent Forge delivers more features than any commercial alternative — at zero license cost.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
                {["Full data ownership", "No per-user fees", "50-criterion QA scoring"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-blue-300 text-[10px] mt-6">
                Pricing data sourced from Vendr (2025), Capterra, SaaSWorthy, and vendor websites.
                TCO estimates based on published average annual contract values.
              </p>
            </div>
          </div>
        )}

        <EngineeringFooter />
      </div>
    </div>
  );
}
