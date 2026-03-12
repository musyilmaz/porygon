export {
  createDemoSchema,
  updateDemoSchema,
  listDemosQuerySchema,
  type CreateDemoInput,
  type UpdateDemoInput,
  type ListDemosQuery,
} from "./demo.schema";

export {
  createStepSchema,
  createStepBodySchema,
  updateStepSchema,
  reorderStepsSchema,
  type CreateStepInput,
  type CreateStepBody,
  type UpdateStepInput,
  type ReorderStepsInput,
} from "./step.schema";

export {
  createHotspotSchema,
  createHotspotBodySchema,
  updateHotspotSchema,
  type CreateHotspotInput,
  type CreateHotspotBody,
  type UpdateHotspotInput,
} from "./hotspot.schema";

export {
  createAnnotationSchema,
  createAnnotationBodySchema,
  updateAnnotationSchema,
  type CreateAnnotationInput,
  type CreateAnnotationBody,
  type UpdateAnnotationInput,
} from "./annotation.schema";

export {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  type CreateWorkspaceInput,
  type UpdateWorkspaceInput,
} from "./workspace.schema";

export {
  loginSchema,
  signupSchema,
  type LoginInput,
  type SignupInput,
} from "./auth.schema";

export {
  createUploadSchema,
  type CreateUploadInput,
} from "./upload.schema";

export {
  recordViewSchema,
  updateViewSchema,
  analyticsQuerySchema,
  type RecordViewInput,
  type UpdateViewInput,
  type AnalyticsQuery,
} from "./analytics.schema";
