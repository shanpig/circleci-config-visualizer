import { parse } from "yaml";
import { CircleCIConfig, Filters } from "./types/circleci.js";
import { WorkflowGraph } from "./types/mermaid.js";

export async function loadCircleCIConfig(filePath: string): Promise<CircleCIConfig> {
  const fileResponse = await fetch(filePath);
  const fileContent = await fileResponse.text();
  const config = parse(fileContent) as CircleCIConfig;
  return config;
}

function stringMatch(regex: string, text: string) {
  console.log(regex.replace(/^\//g, "").replace(/\/$/g, ""));
  return new RegExp(regex.replace(/^\//g, "").replace(/\/$/g, "")).test(text);
}

function shouldIncludeJob(filters?: Filters, branchName = "") {
  if (!filters) return true;

  if (filters.branches?.only) {
    const only = filters.branches.only;
    if (Array.isArray(only)) {
      return only.some((regex) => stringMatch(regex, branchName));
    } else {
      return stringMatch(only, branchName);
    }
  } else if (filters.branches?.ignore) {
    const ignore = filters.branches.ignore;
    if (Array.isArray(ignore)) {
      return !ignore.some((regex) => stringMatch(regex, branchName));
    } else {
      return !stringMatch(ignore, branchName);
    }
  }
}

export function parseWorkflows(config: CircleCIConfig, branchName?: string): WorkflowGraph[] {
  console.log("config: ", config);
  const workflows = config.workflows;

  return Object.entries(workflows).map(([workflowName, workflow]) => {
    const dependencies = workflow.jobs
      .map((job) => {
        if (typeof job === "string") {
          return { job, dependsOn: [] };
        } else {
          const [jobName, jobData] = Object.entries(job)[0];

          if (!shouldIncludeJob(jobData.filters, branchName)) {
            return null;
          }

          return { job: jobData.name || jobName, dependsOn: jobData.requires };
        }
      })
      .filter((job) => job !== null);

    return { name: workflowName, dependencies };
  });
}
