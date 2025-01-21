import { parse } from "yaml";
import { CircleCIConfig, Filters } from "../types/circleci.js";
import { WorkflowGraph } from "../types/cytoscape.js";
import { ElementDefinition } from "cytoscape";

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

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => resolve(event?.target?.result as string);
    reader.onerror = (event) => reject(new Error("error loading yaml file"));

    reader.readAsText(file);
  });
}

export async function loadCircleCIConfig(file: File): Promise<CircleCIConfig> {
  const fileContent = await readFile(file);
  const config = parse(fileContent) as CircleCIConfig;
  return config;
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

export function parseWorkflowGraphElements(workflows: WorkflowGraph[]) {
  console.log("workflows: ", workflows);
  const elements = workflows.reduce<ElementDefinition[]>((acc, workflow) => {
    const jobNodes = workflow.dependencies.map((dependency) => {
      return { data: { id: `${workflow.name}_${dependency.job}`, label: dependency.job } };
    });
    const dependencyNodes = workflow.dependencies
      .map(({ job, dependsOn }) => {
        if (dependsOn) {
          return dependsOn.map((dependsOnItem) => ({
            data: { source: `${workflow.name}_${dependsOnItem}`, target: `${workflow.name}_${job}` },
          }));
        } else {
          return null;
        }
      })
      .filter((d) => d !== null)
      .flat();

    acc.push(...jobNodes);
    acc.push(...dependencyNodes);

    return acc;
  }, []);

  return elements;
}
