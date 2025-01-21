export interface Filters {
  /** One of either only or ignore branch filters must be specified. If both are present, only is used. */
  branches?: {
    only?: string | string[];
    ignore?: string | string[];
  };
}

export interface Job {
  [jobName: string]: {
    name?: string;
    requires?: string[];
    filters?: Filters;
    [key: string]: any;
  };
}

export interface Workflows {
  [workflowName: string]: {
    jobs: (string | Job)[];
  };
}

export interface CircleCIConfig {
  version: number;
  workflows: Workflows;
  [key: string]: any;
}
