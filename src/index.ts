import mermaid from "mermaid";
import { loadCircleCIConfig, parseWorkflows } from "./parser.js";
import { getWorkflowGraphSyntax } from "./renderer.js";

// Render the graph
document.addEventListener("DOMContentLoaded", async () => {
  // Load and parse the config
  const configPath = "/workflow.yaml";
  const workflows = await loadCircleCIConfig(configPath);

  const workflowsGraph = parseWorkflows(workflows);
  const graphSyntax = getWorkflowGraphSyntax(workflowsGraph);

  const graphSyntaxHolder = document.querySelector("#graph-syntax-holder");
  const graphHolder = document.querySelector("#graph-holder");

  if (graphSyntaxHolder) {
    graphSyntaxHolder.innerHTML = graphSyntax;
  }
  if (graphHolder) {
    const { svg } = await mermaid.render("mermaid", graphSyntax);
    graphHolder.innerHTML = svg;
  }
});
