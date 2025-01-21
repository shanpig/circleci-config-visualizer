export interface Dependency {
  job: string;
  dependsOn?: string[];
}

export interface WorkflowGraph {
  name: string;
  dependencies: Dependency[];
}
