import { loadCircleCIConfig, parseWorkflows, parseWorkflowGraphElements } from "./utils/parser.js";
import { getRandomHexColors, renderLegends, renderWorkflowGraph } from "./utils/renderer.js";
import { CircleCIConfig } from "./types/circleci.js";

const featureBranchName = "master";
const releaseBranchName = "release/v3.38.1-cron-20240512";

const formHolderId = "#form-holder";
const graphHolderId = "#graph-holder";
const configHolderId = "#config-holder";
const graphSyntaxHolderId = "#graph-syntax-holder";

let config: CircleCIConfig | null = null;
let formHolder: HTMLFormElement | null = null;
let graphHolder: HTMLDivElement | null = null;
let configHolder: HTMLInputElement | null = null;
let graphSyntaxHolder: HTMLPreElement | null = null;

// @ts-expect-error
window.featureBranchName = featureBranchName;
// @ts-expect-error
window.releaseBranchName = releaseBranchName;
// @ts-expect-error
window.changeBranchName = changeBranchName;
// @ts-expect-error
window.loadUploadedCircleCIConfig = loadUploadedCircleCIConfig;

document.addEventListener("DOMContentLoaded", async () => {
  formHolder = document.querySelector(formHolderId);
  graphHolder = document.querySelector(graphHolderId);
  configHolder = document.querySelector(configHolderId);
  graphSyntaxHolder = document.querySelector(graphSyntaxHolderId);
});

function visualizeWorkflows(branchName: string) {
  if (graphSyntaxHolder && formHolder && config) {
    // Parser
    const workflows = parseWorkflows(config, branchName);

    // Renderer
    const elements = parseWorkflowGraphElements(workflows);
    graphSyntaxHolder.innerHTML = JSON.stringify(elements, null, 2);

    const colors = getRandomHexColors(workflows.length);
    console.log("Random colors: ", colors);

    renderWorkflowGraph({ elements, graphHolderId, workflows, colors });
    renderLegends(workflows, colors);
  }
}

function getCurrentBranchType() {
  if (formHolder) {
    const form = new FormData(formHolder);
    return form.get("branch");
  } else {
    return "feature";
  }
}

function changeBranchName() {
  const branchType = getCurrentBranchType();
  visualizeWorkflows(branchType === "feature" ? featureBranchName : releaseBranchName);
}

async function loadUploadedCircleCIConfig() {
  const file = configHolder?.files?.[0];

  if (configHolder && file) {
    console.log(configHolder, file);

    config = await loadCircleCIConfig(file);

    const branchType = getCurrentBranchType();
    visualizeWorkflows(branchType === "feature" ? featureBranchName : releaseBranchName);
  }
}
