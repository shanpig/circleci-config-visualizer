import { WorkflowGraph } from "./types/mermaid.js";

const nodeSyntax = (str: string, parent: string) => `${parent}_${str.replace(/[^\w]/g, "_")}["${str}"]`;

export function getWorkflowGraphSyntax(workflows: WorkflowGraph[]) {
  console.log(workflows);
  const graphSyntax = workflows.reduce<string>(
    (acc, workflow) => {
      const dependencies = workflow.dependencies
        .map(({ job, dependsOn }) =>
          dependsOn
            ?.map((dependency) => `${nodeSyntax(dependency, workflow.name)} --> ${nodeSyntax(job, workflow.name)}`)
            .join("\n\t")
        )
        .filter(Boolean)
        .join("\n\t");

      const diagramSyntax = `
      \t%% dependencies
      \t${dependencies}
      `;

      acc += `\n\n${diagramSyntax}`;

      return acc;
    },
    `flowchart LR;
  `
  );

  return graphSyntax;
}
