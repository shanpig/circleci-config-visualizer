import { loadCircleCIConfig, parseWorkflows } from "./parser.js";
import { getWorkflowGraphSyntax, renderLegends, renderWorkflowGraph } from "./renderer.js";
import { CircleCIConfig } from "./types/circleci.js";

const configPath = "/workflow.yaml";
let config: CircleCIConfig;
let graphSyntaxHolder: HTMLPreElement | null;
let graphHolder: HTMLDivElement | null;

// Render the graph
document.addEventListener("DOMContentLoaded", async () => {
  // Load and parse the config
  graphSyntaxHolder = document.querySelector("#graph-syntax-holder");
  graphHolder = document.querySelector("#graph-holder");

  if (graphSyntaxHolder && graphHolder) {
    config = await loadCircleCIConfig(configPath);
    visualizeWorkflows(config, "master");
  }
});

function visualizeWorkflows(config: CircleCIConfig, branchName?: string) {
  if (graphSyntaxHolder) {
    const workflows = parseWorkflows(config, branchName);

    // Renderer
    const { elements } = getWorkflowGraphSyntax(workflows);
    graphSyntaxHolder.innerHTML = JSON.stringify(elements, null, 2);
    const { colors } = renderWorkflowGraph(elements, "#graph-holder", workflows);
    renderLegends(workflows, colors);
  }
}

function changeBranchName(branchName: string) {
  console.log(branchName);
  visualizeWorkflows(config, branchName);
}

// @ts-expect-error
window.changeBranchName = changeBranchName;
