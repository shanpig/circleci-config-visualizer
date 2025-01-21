import cytoscape, { ElementDefinition } from "cytoscape";
import { WorkflowGraph } from "./types/mermaid.js";
import cytoscapeDagre from "cytoscape-dagre";

cytoscape.use(cytoscapeDagre);

export function getWorkflowGraphSyntax(workflows: WorkflowGraph[]) {
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

  return {
    elements,
  };
}

function getRandomHexColors(n: number): string[] {
  const colors: string[] = [];
  const hueStep = 360 / n; // Divide the color wheel into n distinct parts
  for (let i = 0; i < n; i++) {
    const hue = Math.floor(i * hueStep);
    const color = `hsl(${hue}, 100%, 30%)`; // Use HSL with a lower lightness for higher contrast
    colors.push(color);
  }
  return colors;
}

export function renderWorkflowGraph(elements: ElementDefinition[], containerId: string, workflows: WorkflowGraph[]) {
  console.log("elements: ", elements);
  const container = document.querySelector<HTMLDivElement>(containerId);
  if (!container) {
    throw new Error("graph container not found.");
  }

  const colors = getRandomHexColors(workflows.length);
  console.log("Random colors: ", colors);

  cytoscape({
    container: container,
    elements,
    style: [
      // Node style
      {
        selector: "node",
        style: {
          shape: "rectangle",
          width: "300px",
          height: 40,
          "background-color": "#fff",
          "border-width": 2,
          "border-color": "#004080",
          "text-valign": "center",
          "text-halign": "center",
          "padding-left": "8px",
          "padding-right": "8px",
          "font-size": 14,
          content: "data(label)",
        },
      },
      ...workflows.map((workflow, index) => ({
        selector: `node[id ^= '${workflow.name}']`,
        style: {
          "border-color": colors[index],
        },
      })),
      // Edge style
      {
        selector: "edge",
        style: {
          width: 2,
          "line-color": "#AAAAAA",
          "target-arrow-color": "#AAAAAA",
          "target-arrow-shape": "triangle",
          "segment-distances": [50],
          "segment-weights": [0.25],
          "curve-style": "taxi", // Curved edges
          "taxi-direction": "horizontal",
          "taxi-turn": "20px",
        },
      },
    ],
    layout: {
      name: "dagre",
      // @ts-expect-error
      rankDir: "LR",
    },
    autoungrabify: true,
  });

  return { colors };
}

export function renderLegends(workflows: WorkflowGraph[], colors: string[]) {
  const legendBox = document.querySelector("#legend-box");
  if (legendBox) {
    const legends = workflows.map((workflow, index) => {
      const legend = document.createElement("div");
      legend.innerHTML = workflow.name;
      legend.classList.add("legend");
      legend.style.color = colors[index];
      return legend;
    });

    legendBox.innerHTML = "";
    legendBox.append(...legends);
  }
}
