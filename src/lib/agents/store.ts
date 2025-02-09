import { BaseAgent } from './baseAgent';

type AgentStore = {
  clientAgent: BaseAgent | null;
  contractorAgent: BaseAgent | null;
};

let agents: AgentStore = {
  clientAgent: null,
  contractorAgent: null,
};

export const setAgent = (type: 'client' | 'contractor', agent: BaseAgent) => {
  agents[`${type}Agent`] = agent;
};

export const getAgent = (type: 'client' | 'contractor'): BaseAgent | null => {
  return agents[`${type}Agent`];
};
