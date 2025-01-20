import { parse } from "yaml";
import { CircleCIConfig } from "./types/circleci.js";
import { WorkflowGraph } from "./types/mermaid.js";

export async function loadCircleCIConfig(filePath: string): Promise<CircleCIConfig> {
  const fileResponse = await fetch(filePath);
  const fileContent = await fileResponse.text();
  const config = parse(fileContent) as CircleCIConfig;
  return config;
}

export function parseWorkflows(config: CircleCIConfig): WorkflowGraph[] {
  const workflows = config.workflows;
  console.log(config);

  return Object.entries(workflows).map(([workflowName, workflow]) => {
    const dependencies = workflow.jobs.map((job) => {
      if (typeof job === "string") {
        return { job, dependsOn: [] };
      } else {
        const [jobName, jobData] = Object.entries(job)[0];

        return { job: jobData.name || jobName, dependsOn: jobData.requires };
      }
    });

    return { name: workflowName, dependencies };
  });
}
