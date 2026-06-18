/**
 * D-ID Agent configuration for Agent Forge.
 * All agents are created with embed: true and valid clip presenter IDs.
 * Each agent has its own client_key for the D-ID SDK.
 */

export interface DIDAgentConfig {
  agentId: string;
  clientKey: string;
  name: string;
  role: string;
  presenterDescription: string;
}

/** Interview coach agents — used in Career Prep / Interview Practice */
export const INTERVIEW_AGENTS: Record<string, DIDAgentConfig> = {
  benjamin_tech: {
    agentId: "v2_agt_Xq67V-eA",
    clientKey: "ck_rJ8EC0fwds9InxQ26vJfG",
    name: "Benjamin",
    role: "Tech Coach",
    presenterDescription: "Sharp and direct coach for software, data & product roles",
  },
  anna_graduate: {
    agentId: "v2_agt_RkWsdlvS",
    clientKey: "ck_rLwwdy_lSx8nlXv1qSQRo",
    name: "Anna",
    role: "Graduate Coach",
    presenterDescription: "Warm and encouraging coach for graduate & early-career roles",
  },
  mary_nhs: {
    agentId: "v2_agt_u9y1wBhF",
    clientKey: "ck_4wrOTPHBdRMMwhCfeIP5Y",
    name: "Mary",
    role: "NHS Interview Coach",
    presenterDescription: "Compassionate coach specialising in NHS values-based interviews",
  },
  sophie_hr: {
    agentId: "v2_agt_dKq4y-h_",
    clientKey: "ck_7YIQ_Vy1IU0Vh6fe6dWaI",
    name: "Sophie",
    role: "HR Director",
    presenterDescription: "Professional UK HR Director — recruitment pitch practice",
  },
  david_sales: {
    agentId: "v2_agt_awQLNZty",
    clientKey: "ck_44T2hCSMuicrHlW3_wahx",
    name: "David",
    role: "Sales Director",
    presenterDescription: "Sceptical but fair UK Sales Director — sales interview practice",
  },
  priya_nhs: {
    agentId: "v2_agt_ke_D5qeP",
    clientKey: "ck_NzEiAvgvAEXGytoIWAQ7D",
    name: "Dr. Priya",
    role: "NHS Consultant",
    presenterDescription: "NHS Consultant conducting values-based clinical interview",
  },
  rachel_career: {
    agentId: "v2_agt_NqsNsDry",
    clientKey: "ck_v_3zZMwWSBURyUWUg9CPm",
    name: "Rachel",
    role: "Career Coach",
    presenterDescription: "Warm career coach for general professional interviews",
  },
};

/** Simulation persona agents — used in SimulationSession voice/video mode */
export const SIMULATION_AGENTS: Record<string, DIDAgentConfig> = {
  sales: INTERVIEW_AGENTS.david_sales,
  hr: INTERVIEW_AGENTS.sophie_hr,
  nhs: INTERVIEW_AGENTS.mary_nhs,
  healthcare: INTERVIEW_AGENTS.mary_nhs,
  tech: INTERVIEW_AGENTS.benjamin_tech,
  graduate: INTERVIEW_AGENTS.anna_graduate,
  career: INTERVIEW_AGENTS.rachel_career,
  default: INTERVIEW_AGENTS.rachel_career,
};

/** All agents combined */
export const ALL_DID_AGENTS = { ...INTERVIEW_AGENTS };

/** Get an interview agent by key, falling back to rachel_career */
export function getInterviewAgent(key: string): DIDAgentConfig {
  return INTERVIEW_AGENTS[key] ?? INTERVIEW_AGENTS.rachel_career;
}

/** Pick the best simulation agent for a given scenario persona/category string */
export function getSimulationAgent(personaOrCategory: string): DIDAgentConfig {
  const lower = personaOrCategory.toLowerCase();
  if (lower.includes("sales") || lower.includes("business") || lower.includes("cold call")) {
    return SIMULATION_AGENTS.sales;
  }
  if (lower.includes("nhs") || lower.includes("health") || lower.includes("nurse") || lower.includes("doctor") || lower.includes("clinical")) {
    return SIMULATION_AGENTS.nhs;
  }
  if (lower.includes("hr") || lower.includes("human resource") || lower.includes("recruit")) {
    return SIMULATION_AGENTS.hr;
  }
  if (lower.includes("tech") || lower.includes("engineer") || lower.includes("software") || lower.includes("data")) {
    return SIMULATION_AGENTS.tech;
  }
  if (lower.includes("grad") || lower.includes("student") || lower.includes("entry")) {
    return SIMULATION_AGENTS.graduate;
  }
  return SIMULATION_AGENTS.default;
}
