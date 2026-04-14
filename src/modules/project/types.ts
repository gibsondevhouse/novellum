// Project module public types

export type ProjectId = number;

export interface MetricValue {
	count: number;
	ready: boolean;
}

export interface ProjectMetrics {
	arcs: MetricValue;
	acts: MetricValue;
	chapters: MetricValue;
	scenes: MetricValue;
}
