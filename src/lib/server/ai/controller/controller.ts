import type {
	AiControllerFailureResponse,
	AiControllerRequest,
	AiControllerResponse,
	AiControllerSuccessResponse,
} from './contracts.js';
import {
	parseModelOutputContent,
	validateControllerOutput,
	type ControllerOutputSchemaName,
} from './output-schemas.js';
import {
	createControllerContextBuilder,
	type AiControllerContextBuilder,
} from './context-builder.js';
import {
	resolveControllerIntent,
	type ResolvedControllerIntent,
} from './intent-resolver.js';
import {
	evaluateControllerPolicy,
	type AiControllerPolicyDecision,
} from './policy-guard.js';
import {
	createControllerWorkflowRegistry,
	type AiControllerWorkflowRegistry,
} from './workflow-registry.js';
import type { AiControllerWorkflowDefinition } from './workflow-contracts.js';
import {
	createControllerModelGateway,
	type ControllerModelGateway,
	type ModelGatewayProviderResolver,
} from './model-gateway.js';
import {
	createControllerArtifactService,
	type ControllerArtifactService,
	type AiControllerStoredArtifact,
} from './artifact-service.js';
import {
	createControllerRunLogger,
	type ControllerRunLogger,
} from './run-log.js';

export interface AiControllerDependencies {
	contextBuilder: AiControllerContextBuilder;
	workflowRegistry: AiControllerWorkflowRegistry;
	modelGateway: ControllerModelGateway;
	artifactService: ControllerArtifactService;
	runLogger: ControllerRunLogger;
}

export interface AiController {
	execute(request: AiControllerRequest, options?: { signal?: AbortSignal }): Promise<AiControllerResponse>;
}

function failure(
	status: AiControllerFailureResponse['status'],
	error: AiControllerFailureResponse['error'],
	runtime?: AiControllerFailureResponse['runtime'],
): AiControllerFailureResponse {
	return { ok: false, status, error, runtime };
}

function success<TOutput>(
	response: AiControllerSuccessResponse<TOutput>,
): AiControllerSuccessResponse<TOutput> {
	return response;
}

function failureStatusForPolicy(policy: AiControllerPolicyDecision): AiControllerFailureResponse['status'] {
	if (policy.ok) return 'failed';
	return policy.code === 'policy_denied' || policy.code === 'unsupported_intent' ? 'blocked' : 'failed';
}

function artifactSummary(workflow: AiControllerWorkflowDefinition, output: unknown): string {
	if (workflow.artifact.type === 'worldbuilding_proposals') return 'Worldbuilding proposals awaiting review.';
	if (workflow.artifact.type === 'worldbuilding_drafts') return 'Worldbuilding drafts awaiting review.';
	if (workflow.artifact.type === 'author_draft_checkpoint') return 'Author draft checkpoint awaiting review.';
	if (workflow.artifact.type === 'outline_checkpoint') return 'Outline checkpoint awaiting review.';
	if (typeof output === 'object' && output) return `${workflow.title} artifact awaiting review.`;
	return `${workflow.title} output awaiting review.`;
}

function payloadArtifactId(payload: unknown): string | null {
	if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) return null;
	const value = (payload as { artifactId?: unknown }).artifactId;
	return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function createAiController(dependencies: AiControllerDependencies): AiController {
	return {
		async execute(request, options = {}) {
			const run = dependencies.runLogger.startRun({
				requestId: request.requestId,
				projectId: request.projectId,
				status: 'received',
			});
			const runtime = { runId: run.id };

			try {
				dependencies.runLogger.appendStep(run.id, 'resolving_intent', 'Resolving controller intent.', {
					action: request.action,
					target: request.target,
				});
				const resolvedIntent: ResolvedControllerIntent = resolveControllerIntent(request);
				const workflow: AiControllerWorkflowDefinition | null = resolvedIntent.workflowId
					? dependencies.workflowRegistry.get(resolvedIntent.workflowId)
					: null;

				dependencies.runLogger.appendStep(run.id, 'policy_check', 'Evaluating controller policy.', {
					intent: resolvedIntent,
					workflowId: workflow?.id ?? null,
				});
				const policy = evaluateControllerPolicy({ request, intent: resolvedIntent, workflow });
				if (!policy.ok) {
					dependencies.runLogger.finishRun(run.id, failureStatusForPolicy(policy), {
						code: policy.code,
						message: policy.message,
					});
					return failure(
						failureStatusForPolicy(policy),
						{
							code: policy.code,
							message: policy.message,
							retryable: policy.code === 'missing_context',
							details: { reasons: policy.reasons },
						},
						runtime,
					);
				}

				if (!workflow || !resolvedIntent || resolvedIntent.intent === 'unsupported') {
					throw new Error('Controller workflow was not resolved.');
				}

				if (resolvedIntent.intent === 'artifact.accept' || resolvedIntent.intent === 'artifact.reject') {
					const artifactId = payloadArtifactId(request.action.payload);
					if (!artifactId) {
						return failure(
							'failed',
							{
								code: 'missing_context',
								message: 'artifactId is required for review decisions.',
								retryable: true,
							},
							runtime,
						);
					}
					const artifact =
						resolvedIntent.intent === 'artifact.accept'
							? dependencies.artifactService.acceptArtifact(
									request.projectId,
									artifactId,
									request.requestedBy,
								)
							: dependencies.artifactService.rejectArtifact(
									request.projectId,
									artifactId,
									request.requestedBy,
									'Rejected through governed controller.',
								);
					dependencies.runLogger.finishRun(
						run.id,
						resolvedIntent.intent === 'artifact.accept' ? 'accepted' : 'rejected',
					);
					return success({
						ok: true,
						requestId: request.requestId,
						status: resolvedIntent.intent === 'artifact.accept' ? 'accepted' : 'rejected',
						runtime,
						artifact: {
							id: artifact.id,
							type: artifact.type,
							status: artifact.status,
							projectId: artifact.projectId,
							ownerId: 'aiControllerArtifacts.v1',
							key: artifact.id,
							schemaVersion: artifact.schemaVersion,
							summary: artifact.summary,
						},
						output: artifact,
					});
				}

				dependencies.runLogger.appendStep(run.id, 'building_context', 'Building context packet.', {
					workflowId: workflow.id,
				});
				const contextPacket = dependencies.contextBuilder.build({
					request,
					maxTokens: workflow.context.maxTokens,
				});

				dependencies.runLogger.appendStep(run.id, 'routing_workflow', 'Workflow resolved.', {
					workflow,
					contextHash: contextPacket.contextHash,
				});

				dependencies.runLogger.appendStep(run.id, 'calling_model', 'Calling model gateway.', {
					workflowId: workflow.id,
				});
				const modelResult = await dependencies.modelGateway.execute({
					request,
					workflow,
					contextPacket,
					signal: options.signal,
				});

				dependencies.runLogger.appendStep(run.id, 'validating_output', 'Validating model output.', {
					model: modelResult.model,
					mocked: modelResult.mocked,
				});
				const parsed = parseModelOutputContent(modelResult.content);
				const validation = validateControllerOutput(
					workflow.output.schemaName as ControllerOutputSchemaName,
					parsed,
				);
				if (!validation.ok) {
					dependencies.runLogger.finishRun(run.id, 'failed', {
						code: 'invalid_model_output',
						message: 'Model output failed controller validation.',
					});
					return failure(
						'failed',
						{
							code: 'invalid_model_output',
							message: 'Model output failed controller validation.',
							retryable: true,
							details: { issues: validation.issues },
						},
						runtime,
					);
				}

				let artifact: AiControllerStoredArtifact | null = null;
				if (workflow.artifact.persist) {
					dependencies.runLogger.appendStep(
						run.id,
						'persisting_artifact',
						'Persisting controller artifact.',
						{ workflowId: workflow.id },
					);
					artifact = dependencies.artifactService.createArtifact({
						requestId: request.requestId,
						runId: run.id,
						projectId: request.projectId,
						workflowId: workflow.id,
						intent: workflow.intent,
						type: workflow.artifact.type,
						status: workflow.artifact.defaultStatus,
						payload: validation.output,
						schemaVersion: workflow.output.schemaVersion,
						summary: artifactSummary(workflow, validation.output),
					});
				}

				const responseStatus = artifact?.status === 'review' ? 'awaiting_review' : 'completed';
				dependencies.runLogger.finishRun(run.id, responseStatus);
				return success({
					ok: true,
					requestId: request.requestId,
					status: responseStatus,
					runtime,
					artifact: artifact
						? {
								id: artifact.id,
								type: artifact.type,
								status: artifact.status,
								projectId: artifact.projectId,
								ownerId: workflow.artifact.ownerId,
								key: artifact.id,
								schemaVersion: artifact.schemaVersion,
								summary: artifact.summary,
							}
						: undefined,
					output: validation.output,
					usage: {
						providerId: 'active',
						modelId: modelResult.model,
						totalTokens: modelResult.usage?.totalTokens,
					},
					metadata: {
						intent: resolvedIntent.intent,
						workflowId: workflow.id,
						contextHash: contextPacket.contextHash,
					},
				});
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Controller execution failed.';
				dependencies.runLogger.finishRun(run.id, 'failed', {
					code: 'unexpected_error',
					message,
				});
				return failure(
					'failed',
					{
						code: 'unexpected_error',
						message,
						retryable: false,
					},
					runtime,
				);
			}
		},
	};
}

export function createDefaultAiController(input: {
	resolveProvider: ModelGatewayProviderResolver;
}): AiController {
	const registry = createControllerWorkflowRegistry();
	return createAiController({
		contextBuilder: createControllerContextBuilder(),
		workflowRegistry: registry,
		modelGateway: createControllerModelGateway({
			resolveProvider: input.resolveProvider,
			registry,
		}),
		artifactService: createControllerArtifactService(),
		runLogger: createControllerRunLogger(),
	});
}
