import { CdpToolkit } from "@coinbase/cdp-langchain";

type AgentStore = {
  clientAgent: CdpToolkit | null;
  contractorAgent: CdpToolkit | null;
};

let agents: AgentStore = {
  clientAgent: null,
  contractorAgent: null,
};

export const setAgent = (type: 'client' | 'contractor', agent: CdpToolkit) => {
  agents[`${type}Agent`] = agent;
};

export const getAgent = (type: 'client' | 'contractor') => {
  return agents[`${type}Agent`];
};
