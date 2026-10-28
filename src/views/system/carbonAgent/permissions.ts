import type {
  AgentEnterpriseBusinessCapabilities,
  AgentProject,
} from './constants';

export const ENTERPRISE_CARBON_PROJECT_BUSINESS_TYPE = 'enterprise_carbon';

export const isEnterpriseCarbonAgentProject = (
  project?: Pick<AgentProject, 'businessType'>,
) => project?.businessType === ENTERPRISE_CARBON_PROJECT_BUSINESS_TYPE;

export const hasEnterpriseBusinessCapability = (
  capabilities: AgentEnterpriseBusinessCapabilities | undefined,
  capability: keyof AgentEnterpriseBusinessCapabilities,
) => capabilities?.[capability] === true;
