import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Code2,
  Stethoscope,
  Briefcase,
  Building2,
  Landmark,
  BookOpen,
  Rocket,
  Video,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Users,
  Trophy,
  MessageSquare,
  Mic,
  Brain,
  Target,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

// Real Tavus persona IDs — others are placeholders not yet configured
const REAL_TAVUS_IDS = new Set(["p00105f03c2f", "p5c154ab23bf", "p39b2c0123f2", "pdac61133ac5"]);

// ─── Career Tracks ─────────────────────────────────────────────────────────────
const CAREER_TRACKS = [
  {
    id: "all",
    label: "All Tracks",
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    id: "graduate",
    label: "Graduate",
    icon: GraduationCap,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  },
  {
    id: "tech",
    label: "Tech & Engineering",
    icon: Code2,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    id: "healthcare",
    label: "Healthcare & NHS",
    icon: Stethoscope,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "finance",
    label: "Finance & Banking",
    icon: Landmark,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    id: "public",
    label: "Public Sector",
    icon: Building2,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
  },
  {
    id: "academic",
    label: "Academic & Research",
    icon: BookOpen,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
  },
  {
    id: "startup",
    label: "Startup & Scale-up",
    icon: Rocket,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    id: "general",
    label: "General",
    icon: Briefcase,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

// ─── Extended Personas (existing + new career prep ones) ───────────────────────
const CAREER_PERSONAS = [
  // Existing UK interview personas
  {
    id: "p00105f03c2f",
    name: "Anna — Graduate Coach",
    role: "HR Interviewer",
    company: "Top UK Graduate Employer",
    description: "Competency-based interview for UK graduate schemes. Covers STAR method, teamwork, leadership, and commercial awareness.",
    category: "graduate",
    difficulty: "intermediate",
    duration: "20–30 min",
    focus: ["STAR method", "Teamwork", "Commercial awareness", "Leadership"],
    avatar: "https://ui-avatars.com/api/?name=Anna&background=6366f1&color=fff&size=128",
  },
  {
    id: "p5c154ab23bf",
    name: "Benjamin — Tech Coach",
    role: "Engineering Manager",
    company: "UK Tech Company",
    description: "Technical and behavioural interview for software engineers, data scientists, and product managers.",
    category: "tech",
    difficulty: "advanced",
    duration: "30–45 min",
    focus: ["System design", "Problem solving", "Behavioural", "Culture fit"],
    avatar: "https://ui-avatars.com/api/?name=Benjamin&background=0ea5e9&color=fff&size=128",
  },
  {
    id: "p39b2c0123f2",
    name: "Mary — NHS Coach",
    role: "NHS Panel Interviewer",
    company: "NHS",
    description: "Values-based interview aligned to NHS Constitution. Covers patient care, compassion, and NHS values.",
    category: "healthcare",
    difficulty: "intermediate",
    duration: "20–30 min",
    focus: ["NHS values", "Patient care", "Compassion", "Teamwork"],
    avatar: "https://ui-avatars.com/api/?name=Mary&background=10b981&color=fff&size=128",
  },
  {
    id: "pdac61133ac5",
    name: "James — General Coach",
    role: "Senior HR Manager",
    company: "Leading UK Employer",
    description: "Structured screening interview covering motivation, strengths, weaknesses, and career goals.",
    category: "general",
    difficulty: "beginner",
    duration: "15–20 min",
    focus: ["Motivation", "Strengths", "Weaknesses", "Career goals"],
    avatar: "https://ui-avatars.com/api/?name=HR&background=f59e0b&color=fff&size=128",
  },
  // New career prep personas
  {
    id: "career_finance_01",
    name: "Sophie — Finance Coach",
    role: "Investment Banking Interviewer",
    company: "Top-Tier UK Bank",
    description: "Rigorous finance interview covering commercial awareness, numerical reasoning, and motivation for banking. Ideal for students targeting Goldman Sachs, Barclays, HSBC, or Big 4.",
    category: "finance",
    difficulty: "advanced",
    duration: "30–45 min",
    focus: ["Commercial awareness", "Numerical reasoning", "Motivation for banking", "Market knowledge"],
    avatar: "https://ui-avatars.com/api/?name=Sophie&background=eab308&color=fff&size=128",
  },
  {
    id: "career_public_01",
    name: "David — Civil Service Coach",
    role: "Civil Service Assessor",
    company: "UK Civil Service",
    description: "Structured interview using the Civil Service Success Profiles framework. Covers Behaviours, Strengths, Experience, Technical, and Ability dimensions.",
    category: "public",
    difficulty: "intermediate",
    duration: "25–35 min",
    focus: ["Success Profiles", "Behaviours", "Strengths", "Civil Service values"],
    avatar: "https://ui-avatars.com/api/?name=David&background=f97316&color=fff&size=128",
  },
  {
    id: "career_academic_01",
    name: "Dr. Priya — Academic Coach",
    role: "University Admissions Tutor",
    company: "Russell Group University",
    description: "Academic interview for university admissions, PhD applications, and research positions. Covers subject knowledge, research motivation, and academic potential.",
    category: "academic",
    difficulty: "advanced",
    duration: "20–30 min",
    focus: ["Subject knowledge", "Research motivation", "Critical thinking", "Academic writing"],
    avatar: "https://ui-avatars.com/api/?name=Priya&background=ec4899&color=fff&size=128",
  },
  {
    id: "career_startup_01",
    name: "Marcus — Startup Coach",
    role: "Startup Founder & Interviewer",
    company: "UK Scale-up",
    description: "Fast-paced startup interview testing adaptability, ownership mindset, and entrepreneurial thinking. Ideal for candidates targeting Series A–C companies.",
    category: "startup",
    difficulty: "intermediate",
    duration: "20–30 min",
    focus: ["Ownership mindset", "Adaptability", "Problem solving", "Cultural fit"],
    avatar: "https://ui-avatars.com/api/?name=Marcus&background=ef4444&color=fff&size=128",
  },
  {
    id: "career_grad_consulting",
    name: "Rachel — Consulting Coach",
    role: "Management Consulting Interviewer",
    company: "Big 4 / MBB",
    description: "Case study and behavioural interview for management consulting roles. Covers structured problem solving, case frameworks, and client communication.",
    category: "graduate",
    difficulty: "advanced",
    duration: "35–45 min",
    focus: ["Case frameworks", "Structured thinking", "Client communication", "Data interpretation"],
    avatar: "https://ui-avatars.com/api/?name=Rachel&background=8b5cf6&color=fff&size=128",
  },
  {
    id: "career_tech_product",
    name: "Aisha — Product Coach",
    role: "Head of Product",
    company: "UK Product-Led Company",
    description: "Product management interview covering product sense, metrics, prioritisation, and cross-functional leadership. Ideal for aspiring PMs.",
    category: "tech",
    difficulty: "advanced",
    duration: "30–40 min",
    focus: ["Product sense", "Metrics & data", "Prioritisation", "Stakeholder management"],
    avatar: "https://ui-avatars.com/api/?name=Aisha&background=06b6d4&color=fff&size=128",
  },
  {
    id: "career_healthcare_allied",
    name: "Tom — Allied Health Coach",
    role: "Allied Health Professional Interviewer",
    company: "NHS Trust",
    description: "Interview for physiotherapy, occupational therapy, radiography, and other allied health roles. Covers clinical reasoning, patient-centred care, and reflective practice.",
    category: "healthcare",
    difficulty: "intermediate",
    duration: "20–30 min",
    focus: ["Clinical reasoning", "Reflective practice", "Patient-centred care", "Teamwork"],
    avatar: "https://ui-avatars.com/api/?name=Tom&background=059669&color=fff&size=128",
  },
  {
    id: "career_general_firstjob",
    name: "Claire — First Job Coach",
    role: "Friendly HR Advisor",
    company: "UK SME",
    description: "Gentle, supportive interview for first-time job seekers. Covers basic interview skills, confidence building, and how to talk about education and part-time experience.",
    category: "general",
    difficulty: "beginner",
    duration: "10–15 min",
    focus: ["Confidence building", "Talking about education", "Basic interview skills", "Body language"],
    avatar: "https://ui-avatars.com/api/?name=Claire&background=d97706&color=fff&size=128",
  },
];

const DIFFICULTY_BADGE: Record<string, string> = {
  beginner: "bg-green-500/15 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/15 text-red-400 border-red-500/20",
};

const TRACK_COLOR: Record<string, string> = {
  graduate: "from-indigo-500/20 to-indigo-500/5 border-indigo-500/20",
  tech: "from-sky-500/20 to-sky-500/5 border-sky-500/20",
  healthcare: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
  finance: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/20",
  public: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
  academic: "from-pink-500/20 to-pink-500/5 border-pink-500/20",
  startup: "from-red-500/20 to-red-500/5 border-red-500/20",
  general: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
};

// ─── Feature Highlights ────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Video, title: "Live AI Video Avatar", desc: "Practice face-to-face with a real-time AI avatar — just like a real interview." },
  { icon: Brain, title: "AI Feedback Report", desc: "Instant post-interview scoring on STAR method, clarity, confidence, and competency." },
  { icon: Target, title: "Track-Specific Coaching", desc: "12 specialist interviewers across 8 career tracks — from NHS to Big 4 consulting." },
  { icon: MessageSquare, title: "Realistic Questions", desc: "Questions tailored to your target role and industry, not generic scripts." },
  { icon: Mic, title: "Voice & Video", desc: "Speak naturally — the AI listens, responds, and adapts just like a real interviewer." },
  { icon: Trophy, title: "Progress Tracking", desc: "Track your scores across sessions and see improvement over time." },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CareerPrep() {
  const [, navigate] = useLocation();
  const [activeTrack, setActiveTrack] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [starting, setStarting] = useState(false);

  const createSession = trpc.interview.createSession.useMutation();

  const filtered = CAREER_PERSONAS.filter(
    (p) => activeTrack === "all" || p.category === activeTrack
  );

  const selected = CAREER_PERSONAS.find((p) => p.id === selectedId);

  const handleStart = async () => {
    if (!selectedId) return;
    setStarting(true);
    try {
      const session = await createSession.mutateAsync({
        personaId: selectedId,
        candidateName: candidateName || undefined,
        jobTitle: jobTitle || selected?.role || undefined,
      });
      navigate(
        `/interview/session/${session.conversationId}?url=${encodeURIComponent(session.conversationUrl)}&persona=${selectedId}&jobTitle=${encodeURIComponent(jobTitle || selected?.role || "")}&candidateName=${encodeURIComponent(candidateName || "")}`
      );
    } catch (e: any) {
      console.error(e);
      const msg = e?.message ?? "";
      if (msg.includes("Invalid persona_id")) {
        toast.error("This interviewer is not yet available. Please choose another.");
      } else {
        toast.error("Could not start the interview. Please try again.");
      }
      setStarting(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* ── Hero Banner ── */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Sparkles size={12} /> AI Video Avatar Interviews
                  </span>
                  <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full">
                    Free · No sign-up required
                  </span>
                  <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Beta
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
                  Practise interviews with<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">a real AI face</span>
                </h1>
                <p className="text-slate-300 text-base sm:text-lg max-w-xl">
                  12 specialist AI interviewers across 8 career tracks. Graduate schemes, NHS, Big 4, Civil Service, startups — practise the real thing, not a script.
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    Instant AI feedback report
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    STAR method scoring
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 text-sm">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    UK-specific competencies
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6 flex-shrink-0">
                {[
                  { value: "12", label: "AI Interviewers" },
                  { value: "8", label: "Career Tracks" },
                  { value: "17", label: "Languages" },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center bg-white/5 border border-white/10 rounded-xl px-4 py-4">
                    <div className="text-2xl sm:text-3xl font-extrabold text-white">{value}</div>
                    <div className="text-xs text-slate-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">

          {/* ── Feature Highlights ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-4 text-center hover:border-indigo-500/40 transition-colors group">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-500/20 transition-colors">
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <div className="text-xs font-semibold text-foreground mb-1">{title}</div>
                <div className="text-xs text-muted-foreground leading-relaxed hidden sm:block">{desc}</div>
              </div>
            ))}
          </div>

          {/* ── Track Filter ── */}
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Choose your career track</h2>
            <div className="flex flex-wrap gap-2">
              {CAREER_TRACKS.map(({ id, label, icon: Icon, bg }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTrack(id); setSelectedId(null); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    activeTrack === id
                      ? `${bg} ring-1 ring-indigo-500/40`
                      : "bg-card border-border text-muted-foreground hover:border-indigo-500/30"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Persona Cards ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                {filtered.length} interviewer{filtered.length !== 1 ? "s" : ""} available
              </h2>
              {selectedId && (
                <span className="text-xs text-indigo-400 font-medium">1 selected</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((persona) => {
                const isSelected = selectedId === persona.id;
                const trackGradient = TRACK_COLOR[persona.category] ?? "from-slate-500/10 to-slate-500/5 border-slate-500/20";
                return (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedId(isSelected ? null : persona.id)}
                    className={`text-left rounded-xl border p-5 transition-all bg-gradient-to-br ${trackGradient} ${
                      isSelected
                        ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/10"
                        : "hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-12 h-12 rounded-full border-2 border-white/20 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm leading-snug">{persona.name}</h3>
                          {isSelected
                            ? <CheckCircle2 size={16} className="text-indigo-400 flex-shrink-0 mt-0.5" />
                            : !REAL_TAVUS_IDS.has(persona.id) && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-400 border border-slate-600/40 flex-shrink-0">
                                Soon
                              </span>
                            )
                          }
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{persona.role}</p>
                        <p className="text-xs text-muted-foreground/70">{persona.company}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">{persona.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {persona.focus.slice(0, 3).map((f) => (
                        <span key={f} className="text-xs bg-white/5 border border-white/10 text-muted-foreground px-2 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${DIFFICULTY_BADGE[persona.difficulty]}`}>
                        {persona.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock size={11} /> {persona.duration}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Start Panel ── */}
          {selected && (
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <img
                  src={selected.avatar}
                  alt={selected.name}
                  className="w-16 h-16 rounded-full border-2 border-indigo-500/40 flex-shrink-0"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Ready to practise with {selected.name}?</h3>
                    <p className="text-sm text-muted-foreground">{selected.description}</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Your name (optional)
                      </label>
                      <Input
                        placeholder="e.g. Alex Johnson"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        className="bg-background/50 border-border text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Target role (optional)
                      </label>
                      <Input
                        placeholder={`e.g. ${selected.role}`}
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="bg-background/50 border-border text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <>
                      <Button
                        onClick={handleStart}
                        disabled={starting}
                        size="lg"
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 px-8"
                      >
                        {starting ? (
                          <>Connecting…</>
                        ) : (
                          <>
                            <Video size={18} />
                            Start Interview
                            <ArrowRight size={16} />
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        Camera &amp; microphone required
                      </p>
                    </>
                </div>
              </div>
            </div>
          )}

          {/* ── Tips Section ── */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
              <Star size={16} className="text-yellow-400" />
              Tips for getting the most out of AI interview practice
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { tip: "Find a quiet space", desc: "Reduce background noise so the AI can hear you clearly and respond naturally." },
                { tip: "Use the STAR method", desc: "Structure answers: Situation → Task → Action → Result. The AI scores this directly." },
                { tip: "Treat it like the real thing", desc: "Dress professionally, sit up straight, and maintain eye contact with the camera." },
                { tip: "Review your feedback report", desc: "After each session, read the AI report carefully — it identifies specific improvement areas." },
                { tip: "Practise multiple tracks", desc: "Try different interviewers to build versatility across different interview styles." },
                { tip: "Repeat until confident", desc: "There is no limit on sessions. Repetition is the fastest way to build interview confidence." },
              ].map(({ tip, desc }) => (
                <div key={tip} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={12} className="text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{tip}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Also Available ── */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base font-bold text-white mb-2">Also available in Agent Forge</h2>
            <p className="text-sm text-slate-400 mb-5">Beyond interview prep, Agent Forge offers a full suite of AI-powered practice tools.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: MessageSquare, title: "Chat Simulations", desc: "Practice customer service, sales, and support conversations in text.", href: "/scenarios" },
                { icon: Mic, title: "Phone Simulations", desc: "Live voice role-play with AI customers across 38+ scenarios.", href: "/scenarios" },
                { icon: Users, title: "Team Leaderboard", desc: "Compare your scores with peers and track team-wide progress.", href: "/leaderboard" },
              ].map(({ icon: Icon, title, desc, href }) => (
                <a
                  key={title}
                  href={href}
                  className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
