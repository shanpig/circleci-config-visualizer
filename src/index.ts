import { loadCircleCIConfig, parseWorkflows, parseWorkflowGraphElements } from "./utils/parser.js";
import { getRandomHexColors, renderLegends, renderWorkflowGraph } from "./utils/renderer.js";
import { CircleCIConfig } from "./types/circleci.js";

const configPath = "/workflow.yaml";
const graphHolderId = "#graph-holder";
const graphSyntaxHolderId = "#graph-syntax-holder";
let config: CircleCIConfig;
let graphSyntaxHolder: HTMLPreElement | null;
let graphHolder: HTMLDivElement | null;

// Render the graph
document.addEventListener("DOMContentLoaded", async () => {
  // Load and parse the config
  graphSyntaxHolder = document.querySelector(graphSyntaxHolderId);
  graphHolder = document.querySelector(graphHolderId);

  if (graphSyntaxHolder && graphHolder) {
    config = await loadCircleCIConfig(configPath);
    visualizeWorkflows({ branchName: "master" });
  }
});

function visualizeWorkflows({ branchName }: { branchName?: string }) {
  if (graphSyntaxHolder) {
    // Parser
    const workflows = parseWorkflows(config, branchName);

    // Renderer
    const { elements } = parseWorkflowGraphElements(workflows);
    graphSyntaxHolder.innerHTML = JSON.stringify(elements, null, 2);

    const colors = getRandomHexColors(workflows.length);
    console.log("Random colors: ", colors);

    renderWorkflowGraph({ elements, graphHolderId, workflows, colors });
    renderLegends(workflows, colors);
  }
}

function changeBranchName(branchName: string) {
  console.log(branchName);
  visualizeWorkflows({ branchName });
}

// @ts-expect-error
window.changeBranchName = changeBranchName;
