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
  updateHotspotSchema,
  type CreateHotspotInput,
  type UpdateHotspotInput,
} from "./hotspot.schema";

export {
  createAnnotationSchema,
  type CreateAnnotationInput,
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
