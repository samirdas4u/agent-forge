/**
 * D-ID Agent configuration for Agent Forge.
 * Each entry maps a persona name to a D-ID agent ID created via the D-ID API.
 * The client_key is the shared key for all agents (domain-restricted).
 */

export const DID_CLIENT_KEY = "ck_fs3Btmeky1ia8JW1h6NF5";

export interface DIDAgentConfig {
  agentId: string;
  name: string;
  role: string;
  presenterDescription: string; // for display
}

/** Interview coach agents — used in Career Prep / Interview Practice */
export const INTERVIEW_AGENTS: Record<string, DIDAgentConfig> = {
  anna_graduate: {
    agentId: "v2_agt_mqczb_MF",
    name: "Anna",
    role: "UK Graduate Interview Coach",
    presenterDescription: "Warm and encouraging coach for graduate & early-career roles",
  },
  benjamin_tech: {
    agentId: "v2_agt_InqDUVb8",
    name: "Benjamin",
    role: "UK Tech Interview Coach",
    presenterDescription: "Sharp and direct coach for software, data & product roles",
  },
  mary_nhs: {
    agentId: "v2_agt_0aqenlkp",
    name: "Mary",
    role: "NHS Interview Coach",
    presenterDescription: "Compassionate coach specialising in NHS values-based interviews",
  },
  general: {
    agentId: "v2_agt_CQ7Qj2SG",
    name: "General Interviewer",
    role: "UK Competency Interviewer",
    presenterDescription: "Professional competency-based interviewer for any UK role",
  },
};

/** Simulation persona agents — used in SimulationSession voice/video mode */
export const SIMULATION_AGENTS: Record<string, DIDAgentConfig> = {
  david_sales: {
    agentId: "v2_agt_xzfMSXj3",
    name: "David",
    role: "Sales Manager",
    presenterDescription: "Sceptical but fair UK Sales Manager — cold call practice",
  },
  sophie_hr: {
    agentId: "v2_agt_I_jCiTZR",
    name: "Sophie",
    role: "HR Director",
    presenterDescription: "Professional UK HR Director — recruitment pitch practice",
  },
  priya_nhs: {
    agentId: "v2_agt_kAlNzTk0",
    name: "Dr. Priya",
    role: "NHS Hiring Manager",
    presenterDescription: "NHS Consultant conducting values-based interview",
  },
};

/** All agents combined */
export const ALL_DID_AGENTS = { ...INTERVIEW_AGENTS, ...SIMULATION_AGENTS };

/** Map from old Tavus persona IDs to new D-ID agent IDs */
export const TAVUS_TO_DID_MAP: Record<string, string> = {
  p00105f03c2f: INTERVIEW_AGENTS.anna_graduate.agentId, // Anna (graduate)
  p5c154ab23bf: INTERVIEW_AGENTS.benjamin_tech.agentId, // Benjamin (tech)
  p39b2c0123f2: INTERVIEW_AGENTS.mary_nhs.agentId,      // Mary (NHS)
  pdac61133ac5: INTERVIEW_AGENTS.general.agentId,        // General interviewer
};
