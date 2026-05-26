/**
 * ScenarioWizard — Solidroad / Second Nature / Mindtickle-style
 * multi-step scenario creation / editing wizard.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────────────────┐
 *   │ Header: title + Create/Save button                       │
 *   ├────────────┬──────────────────────────┬──────────────────┤
 *   │ Left nav   │ Main content             │ Live preview     │
 *   │ (steps)    │ (active step form)       │ (summary panel)  │
 *   └────────────┴──────────────────────────┴──────────────────┘
 */

import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import {
  Bot, BookOpen, Camera, CheckCircle2, ChevronRight, Clock, FileText,
  Folder, Globe, Layers, Lightbulb, Save, Settings2, Target, Trash2, Users, X, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";

// ── Types ──────────────────────────────────────────────────────────────────

export type WizardForm = {
  // Step 1 — Simulation Type
  title: string;
  channel: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  languageLock: string | null;
  // Step 2 — Learners
  learnerRole: string;
  learnerTeam: string;
  // Step 3 — AI Persona
  aiPersona: string;
  personaRole: string;
  personaCompany: string;
  personaPersonality: string;
  // Step 4 — Focus Area
  focusMode: "prompt" | "skill";
  systemPrompt: string;
  focusSkill: string;
  // Step 5 — Instructions & Meta
  description: string;
  tags: string;
  scoringNotes: string;
  // Extra fields
  folder: string;
  personaAvatarUrl: string;
};

export const EMPTY_WIZARD_FORM: WizardForm = {
  title: "",
  channel: "text",
  category: "sales",
  difficulty: "beginner",
  estimatedMinutes: 10,
  languageLock: null,
  learnerRole: "",
  learnerTeam: "",
  aiPersona: "",
  personaRole: "",
  personaCompany: "",
  personaPersonality: "professional",
  focusMode: "prompt",
  systemPrompt: "",
  focusSkill: "",
  description: "",
  tags: "",
  scoringNotes: "",
  folder: "",
  personaAvatarUrl: "",
};

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "sales",            label: "Sales",            emoji: "💼" },
  { value: "customer_service", label: "Customer Service", emoji: "🎧" },
  { value: "interview",        label: "Interview",        emoji: "🤝" },
  { value: "negotiation",      label: "Negotiation",      emoji: "⚖️" },
  { value: "presentation",     label: "Presentation",     emoji: "📊" },
];

const CHANNELS = [
  { value: "text",  label: "Text Chat",    icon: "💬" },
  { value: "voice", label: "Voice Call",   icon: "🎙️" },
  { value: "email", label: "Email",        icon: "📧" },
  { value: "video", label: "Video Call",   icon: "📹" },
];

const DIFFICULTIES = [
  { value: "beginner",     label: "Easy",    color: "oklch(0.38 0.12 160)", bg: "oklch(0.95 0.06 160)" },
  { value: "intermediate", label: "Medium",  color: "oklch(0.38 0.18 264)", bg: "oklch(0.95 0.05 264)" },
  { value: "advanced",     label: "Hard",    color: "oklch(0.45 0.18 25)",  bg: "oklch(0.97 0.06 25)"  },
];

const PERSONALITIES = [
  { value: "professional",  label: "Professional & Formal" },
  { value: "friendly",      label: "Friendly & Warm" },
  { value: "skeptical",     label: "Skeptical & Challenging" },
  { value: "busy",          label: "Busy & Impatient" },
  { value: "analytical",    label: "Analytical & Detail-oriented" },
  { value: "aggressive",    label: "Aggressive & Difficult" },
];

const FOCUS_SKILLS = [
  "Active Listening", "Objection Handling", "Rapport Building",
  "Needs Discovery", "Closing Techniques", "Empathy & Tone",
  "Persuasion & Influence", "Conflict Resolution", "Storytelling",
  "Product Knowledge", "Time Management", "Follow-up Strategy",
];

const STEPS = [
  { id: "type",        label: "Type",        icon: Layers },
  { id: "learners",    label: "Learners",    icon: Users },
  { id: "persona",     label: "AI Persona",  icon: Bot },
  { id: "focus",       label: "Focus area",  icon: Target },
  { id: "instructions",label: "Instructions",icon: FileText },
];

// ── Helper components ──────────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-sm font-semibold text-gray-800">{children}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl",
        "focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400",
        "placeholder:text-gray-300 bg-white transition-shadow",
        className
      )}
      {...props}
    />
  );
}

function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl",
        "focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400",
        "bg-white transition-shadow appearance-none",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl",
        "focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400",
        "placeholder:text-gray-300 bg-white resize-none transition-shadow",
        className
      )}
      {...props}
    />
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={16} className="text-indigo-500" />
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-gray-400 ml-6">{subtitle}</p>}
    </div>
  );
}

// ── Step content components ────────────────────────────────────────────────

function StepType({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle icon={Layers} title="Simulation type" subtitle="Define the basic structure of this simulation" />

      {/* Title */}
      <div>
        <FieldLabel>Title <span className="text-red-400">*</span></FieldLabel>
        <Input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="e.g. Cold Call: SaaS Product Demo"
        />
      </div>

      {/* Channel */}
      <div>
        <FieldLabel hint="How will the learner interact with the AI persona?">Channel</FieldLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CHANNELS.map((ch) => (
            <button
              key={ch.value}
              type="button"
              onClick={() => set("channel", ch.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all",
                form.channel === ch.value
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <span className="text-lg">{ch.icon}</span>
              {ch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <FieldLabel>Category</FieldLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => set("category", cat.value)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                form.category === cat.value
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 shadow-sm"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <FieldLabel>Difficulty</FieldLabel>
        <div className="grid grid-cols-3 gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => set("difficulty", d.value)}
              className={cn(
                "py-2.5 rounded-xl border text-sm font-bold transition-all",
                form.difficulty === d.value
                  ? "shadow-sm"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
              )}
              style={form.difficulty === d.value ? {
                background: d.bg, color: d.color, borderColor: d.color + "66"
              } : {}}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Language */}
      <div>
        <FieldLabel hint="Force the AI to respond in a specific language, regardless of the learner's UI setting">
          Customer Language
        </FieldLabel>
        <div className="relative">
          <Select
            value={form.languageLock ?? ""}
            onChange={(e) => set("languageLock", e.target.value || null)}
          >
            <option value="">🌐 Any language (follows learner preference)</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </Select>
          <Globe size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
        </div>
      </div>

      {/* Duration */}
      <div>
        <FieldLabel hint="Approximate time to complete this simulation">Estimated duration (minutes)</FieldLabel>
        <div className="flex items-center gap-3">
          {[5, 10, 15, 20, 30].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => set("estimatedMinutes", m)}
              className={cn(
                "px-4 py-2 rounded-xl border text-sm font-semibold transition-all",
                form.estimatedMinutes === m
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300"
              )}
            >
              {m}m
            </button>
          ))}
          <Input
            type="number"
            min={1}
            max={120}
            value={form.estimatedMinutes}
            onChange={(e) => set("estimatedMinutes", parseInt(e.target.value) || 10)}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}

function StepLearners({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Users}
        title="Learners"
        subtitle="Optionally specify which roles or teams this simulation is designed for"
      />

      <div>
        <FieldLabel hint="e.g. Account Executive, Customer Success Manager, SDR">Learner role</FieldLabel>
        <Input
          value={form.learnerRole}
          onChange={(e) => set("learnerRole", e.target.value)}
          placeholder="e.g. Account Executive"
        />
      </div>

      <div>
        <FieldLabel hint="e.g. EMEA Sales, Enterprise Support">Team</FieldLabel>
        <Input
          value={form.learnerTeam}
          onChange={(e) => set("learnerTeam", e.target.value)}
          placeholder="e.g. EMEA Sales Team"
        />
      </div>

      <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
        <div className="flex items-start gap-2.5">
          <Lightbulb size={14} className="text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-600 leading-relaxed">
            Specifying a role and team helps learners understand the context of the simulation and allows managers to filter simulations by team in future analytics views.
          </p>
        </div>
      </div>
    </div>
  );
}

function AvatarUploader({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = trpc.admin.uploadPersonaAvatar.useMutation({
    onSuccess: (data) => { set("personaAvatarUrl", data.url); setUploading(false); },
    onError: () => setUploading(false),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar preview */}
      <div
        className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-indigo-400 transition-colors"
        onClick={() => fileRef.current?.click()}
      >
        {form.personaAvatarUrl ? (
          <img src={form.personaAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : uploading ? (
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        ) : (
          <Camera size={20} className="text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-700 mb-1">Persona photo</p>
        <p className="text-xs text-gray-400 mb-2">Upload a photo or illustration to make the persona feel real</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {uploading ? "Uploading…" : "Choose photo"}
          </button>
          {form.personaAvatarUrl && (
            <button
              type="button"
              onClick={() => set("personaAvatarUrl", "")}
              className="px-3 py-1.5 rounded-lg border border-red-100 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function StepPersona({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  const PREBUILT_PERSONAS = [
    { name: "Sarah Chen",     role: "VP of Operations",    company: "TechCorp",       personality: "analytical" },
    { name: "James Miller",   role: "Procurement Manager", company: "GlobalMfg",      personality: "skeptical" },
    { name: "Priya Sharma",   role: "HR Director",         company: "FinanceGroup",   personality: "professional" },
    { name: "Carlos Ruiz",    role: "IT Manager",          company: "RetailChain",    personality: "busy" },
    { name: "Emma Thompson",  role: "CEO",                 company: "StartupXYZ",     personality: "friendly" },
    { name: "David Park",     role: "Sales Director",      company: "Competitor Inc", personality: "aggressive" },
  ];

  const [tab, setTab] = useState<"select" | "create">("select");

  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Bot}
        title="AI Persona"
        subtitle="Define who the AI will roleplay as during the simulation"
      />

      {/* Tab switcher */}
      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        {(["select", "create"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 text-sm font-semibold transition-all",
              tab === t
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            {t === "select" ? "Select persona" : "Create persona"}
          </button>
        ))}
      </div>

      {tab === "select" ? (
        <div>
          <FieldLabel hint="Choose a pre-built persona or switch to Create to define a custom one">Prebuilt Persona</FieldLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PREBUILT_PERSONAS.map((p) => {
              const selected = form.aiPersona === p.name && form.personaRole === p.role;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    set("aiPersona", p.name);
                    set("personaRole", p.role);
                    set("personaCompany", p.company);
                    set("personaPersonality", p.personality);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                    selected
                      ? "border-indigo-400 bg-indigo-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                    selected ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
                    <div className="text-xs text-gray-400 truncate">{p.role} · {p.company}</div>
                  </div>
                  {selected && <CheckCircle2 size={14} className="text-indigo-500 shrink-0 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Persona name</FieldLabel>
              <Input
                value={form.aiPersona}
                onChange={(e) => set("aiPersona", e.target.value)}
                placeholder="e.g. Sarah Chen"
              />
            </div>
            <div>
              <FieldLabel>Job title / Role</FieldLabel>
              <Input
                value={form.personaRole}
                onChange={(e) => set("personaRole", e.target.value)}
                placeholder="e.g. VP of Operations"
              />
            </div>
          </div>
          <div>
            <FieldLabel>Company</FieldLabel>
            <Input
              value={form.personaCompany}
              onChange={(e) => set("personaCompany", e.target.value)}
              placeholder="e.g. TechCorp Ltd"
            />
          </div>
          <div>
            <FieldLabel hint="This shapes how the AI responds throughout the simulation">Personality</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => set("personaPersonality", p.value)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl border text-sm font-medium transition-all text-left",
                    form.personaPersonality === p.value
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Avatar upload — always visible */}
      <div>
        <FieldLabel hint="Optional: upload a photo or illustration to make the persona feel real">
          Persona photo
        </FieldLabel>
        <AvatarUploader form={form} set={set} />
      </div>
    </div>
  );
}

function StepFocus({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={Target}
        title="Focus area"
        subtitle="Define what skill or scenario the AI should focus on"
      />

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        {(["prompt", "skill"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => set("focusMode", mode)}
            className={cn(
              "flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all",
              form.focusMode === mode
                ? "border-indigo-400 bg-indigo-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <div className="flex items-center gap-2">
              {mode === "prompt" ? <FileText size={14} className="text-indigo-500" /> : <Zap size={14} className="text-indigo-500" />}
              <span className="text-sm font-bold text-gray-800">
                {mode === "prompt" ? "Simulation prompt" : "Pick a skill"}
              </span>
              {form.focusMode === mode && (
                <div className="ml-auto w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {mode === "prompt"
                ? "Write a short role play prompt for the AI to generate a scenario"
                : "Focus this role play on developing a specific communication skill"}
            </p>
          </button>
        ))}
      </div>

      {form.focusMode === "prompt" ? (
        <div>
          <FieldLabel hint="Describe the scenario context, the AI's goals, and how they should behave">
            Write a short prompt for the AI to generate a scenario <span className="text-red-400">*</span>
          </FieldLabel>
          <Textarea
            value={form.systemPrompt}
            onChange={(e) => set("systemPrompt", e.target.value)}
            placeholder={`You are ${form.aiPersona || "[persona name]"}, ${form.personaRole || "[job title]"} at ${form.personaCompany || "[company]"}. You are ${form.personaPersonality || "professional"} in your communication style.\n\nThe learner is a ${form.learnerRole || "sales representative"} who has called to discuss [topic]. Your goal is to [objective].\n\nRespond realistically. Be ${form.difficulty === "advanced" ? "challenging and push back on weak arguments" : form.difficulty === "intermediate" ? "moderately receptive but ask probing questions" : "relatively open but ask clarifying questions"}.`}
            rows={10}
            className="font-mono text-xs"
          />
          <div className="flex items-start gap-2 mt-2">
            <Lightbulb size={12} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400">
              Tip: Include the persona's emotional state, specific objections they should raise, and what a successful outcome looks like for the learner.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <FieldLabel hint="The AI will structure the conversation to help the learner practise this skill">Select a skill to develop</FieldLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FOCUS_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => set("focusSkill", skill)}
                className={cn(
                  "px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-left",
                  form.focusSkill === skill
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StepInstructions({ form, set }: { form: WizardForm; set: (k: keyof WizardForm, v: any) => void }) {
  return (
    <div className="space-y-6">
      <SectionTitle
        icon={FileText}
        title="Instructions & scoring"
        subtitle="Add context for learners and scoring guidance for the AI evaluator"
      />

      <div>
        <FieldLabel hint="Shown to the learner before they start the simulation">Learner briefing / description</FieldLabel>
        <Textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="e.g. You are an Account Executive at a SaaS company. You have a scheduled call with a prospect who has expressed interest in your product. Your goal is to qualify their needs and book a follow-up demo."
          rows={4}
        />
      </div>

      <div>
        <FieldLabel hint="Guidance for the AI scoring engine — what should it look for?">Scoring notes (optional)</FieldLabel>
        <Textarea
          value={form.scoringNotes}
          onChange={(e) => set("scoringNotes", e.target.value)}
          placeholder="e.g. Award high marks for active listening, clear value proposition, and handling the pricing objection professionally. Penalise for being pushy or not acknowledging the prospect's concerns."
          rows={4}
        />
      </div>

      <div>
        <FieldLabel hint="Comma-separated keywords for filtering and search">Tags</FieldLabel>
        <Input
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="e.g. cold-call, saas, b2b, enterprise"
        />
      </div>

      <div>
        <FieldLabel hint="Group this scenario into a named folder (e.g. French Sales Pack, Onboarding Series)">Folder (optional)</FieldLabel>
        <div className="relative">
          <Folder size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={form.folder}
            onChange={(e) => set("folder", e.target.value)}
            placeholder="e.g. French Sales Pack"
            className="pl-8"
          />
        </div>
      </div>
    </div>
  );
}

// ── Live Preview Panel ─────────────────────────────────────────────────────

function PreviewPanel({ form }: { form: WizardForm }) {
  const cat = CATEGORIES.find((c) => c.value === form.category);
  const diff = DIFFICULTIES.find((d) => d.value === form.difficulty);
  const lang = form.languageLock
    ? SUPPORTED_LANGUAGES.find((l) => l.code === form.languageLock) ?? null
    : null;

  const rows: { label: string; value: string | null }[] = [
    { label: "Difficulty",  value: diff?.label ?? null },
    { label: "Channel",     value: CHANNELS.find((c) => c.value === form.channel)?.label ?? null },
    { label: "AI Persona",  value: form.aiPersona || null },
    { label: "Language",    value: lang ? `${lang.flag} ${lang.label}` : "🌐 English (default)" },
    { label: "Scorecard",   value: form.scoringNotes ? "Custom notes added" : null },
    { label: "Learner",     value: form.learnerRole || null },
    { label: "Team",        value: form.learnerTeam || null },
    { label: "Duration",    value: form.estimatedMinutes ? `${form.estimatedMinutes} min` : null },
    { label: "Folder",      value: form.folder || null },
  ];

  return (
    <div className="w-56 shrink-0 border-l border-gray-100 bg-gray-50/60 p-5 overflow-y-auto hidden lg:block">
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Preview</h3>

      {/* Persona avatar + title */}
      <div className="mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
          {form.personaAvatarUrl ? (
            <img src={form.personaAvatarUrl} alt="persona" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-indigo-600">
              {form.aiPersona ? form.aiPersona.charAt(0).toUpperCase() : "?"}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">
            {form.title || <span className="text-gray-300 font-normal">Untitled</span>}
          </p>
          {cat && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-2">
            <span className="text-xs text-gray-400 shrink-0">{label}</span>
            <span className={cn(
              "text-xs font-medium text-right",
              value ? "text-gray-700" : "text-gray-300"
            )}>
              {value ?? "None applied"}
            </span>
          </div>
        ))}
      </div>

      {/* Completion indicator */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Completion</p>
        {[
          { label: "Title",    done: !!form.title },
          { label: "Persona",  done: !!form.aiPersona },
          { label: "Prompt",   done: !!form.systemPrompt || !!form.focusSkill },
          { label: "Language", done: true },
        ].map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2 mb-1.5">
            <div className={cn(
              "w-3.5 h-3.5 rounded-full flex items-center justify-center",
              done ? "bg-green-500" : "bg-gray-200"
            )}>
              {done && <CheckCircle2 size={9} className="text-white" />}
            </div>
            <span className={cn("text-xs", done ? "text-gray-700" : "text-gray-400")}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Wizard ────────────────────────────────────────────────────────────

interface ScenarioWizardProps {
  initial: WizardForm & { id?: number };
  onClose: () => void;
  onSave: (data: WizardForm & { id?: number }) => void;
  isPending: boolean;
}

export default function ScenarioWizard({ initial, onClose, onSave, isPending }: ScenarioWizardProps) {
  const [form, setForm] = useState<WizardForm>(initial);
  const [step, setStep] = useState(0);

  const set = (key: keyof WizardForm, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.title.trim()) {
      alert("Please add a title before saving.");
      setStep(0);
      return;
    }
    if (!form.systemPrompt.trim() && !form.focusSkill.trim()) {
      alert("Please add a simulation prompt or select a focus skill.");
      setStep(3);
      return;
    }
    onSave({ ...form, id: initial.id });
  };

  const stepContent = [
    <StepType form={form} set={set} />,
    <StepLearners form={form} set={set} />,
    <StepPersona form={form} set={set} />,
    <StepFocus form={form} set={set} />,
    <StepInstructions form={form} set={set} />,
  ];

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Top header bar */}
      <div className="shrink-0 h-14 border-b border-gray-200 flex items-center justify-between px-5 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {initial.id ? "Edit Scenario" : "New Scenario"}
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-sm text-gray-400 truncate max-w-xs">
            {form.title || "Untitled"}
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          <Save size={14} />
          {isPending ? "Saving…" : initial.id ? "Save Changes" : "Create"}
        </button>
      </div>

      {/* Body: left nav + main + preview */}
      <div className="flex-1 flex min-h-0">
        {/* Left step nav */}
        <div className="w-44 shrink-0 border-r border-gray-100 bg-gray-50/60 py-4 overflow-y-auto hidden sm:block">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === i;
            const done = i < step;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all text-left",
                  active
                    ? "bg-white border-r-2 border-indigo-500 text-indigo-700 font-semibold"
                    : done
                    ? "text-gray-500 hover:bg-white/60"
                    : "text-gray-400 hover:bg-white/60"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                  active ? "bg-indigo-600 text-white" : done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                )}>
                  {done ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <span className="truncate">{s.label}</span>
                {active && <ChevronRight size={12} className="ml-auto text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8">
            {stepContent[step]}

            {/* Step navigation */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
              >
                Back
              </button>
              <div className="flex items-center gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStep(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      i === step ? "bg-indigo-600 w-4" : i < step ? "bg-green-400" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all flex items-center gap-1.5"
                >
                  Next <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Save size={14} />
                  {isPending ? "Saving…" : initial.id ? "Save Changes" : "Create Scenario"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right preview panel */}
        <PreviewPanel form={form} />
      </div>
    </div>
  );
}
