import { ConvexError } from "convex/values";

export type BackendErrorSchema = {
  _tag: string;
  context: ErrorContext;
};

type ErrorContext = {
  message: string;
  error?: unknown;
  [key: string]: any;
};

export type NotAuthenticated = ReturnType<typeof notAuthenticated>;

export type UserNotFound = ReturnType<typeof userNotFound>;

export type SummaryGenerationFailed = ReturnType<
  typeof summaryGenerationFailed
>;

export type BackendErrors =
  | NotAuthenticated
  | UserNotFound
  | SummaryGenerationFailed
  | CreateThreadFailed
  | RateLimitExceeded;

export type RateLimitExceeded = ReturnType<typeof rateLimitExceeded>;

export type CreateThreadFailed = ReturnType<typeof createThreadFailed>;

export function notAuthenticated(context: ErrorContext) {
  return {
    _tag: "NotAuthenticated",
    context,
  } as const satisfies BackendErrorSchema;
}

export function userNotFound(context: ErrorContext) {
  return {
    _tag: "UserNotFound",
    context,
  } as const satisfies BackendErrorSchema;
}

export function summaryGenerationFailed(context: ErrorContext) {
  return {
    _tag: "SummaryGenerationFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function createThreadFailed(context: ErrorContext) {
  return {
    _tag: "CreateThreadFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function generateAiTextFailed(context: ErrorContext) {
  return {
    _tag: "GenerateAiTextFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function sendAiMessageFailed(context: ErrorContext) {
  return {
    _tag: "SendAiMessageFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function getAiThreadsFailed(context: ErrorContext) {
  return {
    _tag: "GetAiThreadsFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function getAiThreadMessagesFailed(context: ErrorContext) {
  return {
    _tag: "GetAiThreadMessagesFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function userAlreadyAuthenticated(context: ErrorContext) {
  return {
    _tag: "UserAlreadyAuthenticated",
    context,
  } as const satisfies BackendErrorSchema;
}

export function accessingAuthedMaterialAsAnonymousUser(context: ErrorContext) {
  return {
    _tag: "AccessingAuthedMaterialAsAnonymousUser",
    context,
  } as const satisfies BackendErrorSchema;
}

export function failedToCreateUser(context: ErrorContext) {
  return {
    _tag: "FailedToCreateUser",
    context,
  } as const satisfies BackendErrorSchema;
}

export function threadMigrationFailed(context: ErrorContext) {
  return {
    _tag: "ThreadMigrationFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function continueThreadFailed(context: ErrorContext) {
  return {
    _tag: "ContinueThreadFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function aiThreadNotFound(context: ErrorContext) {
  return {
    _tag: "AiThreadNotFound",
    context,
  } as const satisfies BackendErrorSchema;
}

export function aiToolFailure(context: ErrorContext) {
  return {
    _tag: "AiToolFailure",
    context,
  } as const satisfies BackendErrorSchema;
}

export function getAiProfilePictureFailed(context: ErrorContext) {
  return {
    _tag: "GetAiProfilePictureFailed",
    context,
  } as const satisfies BackendErrorSchema;
}

export function aiAgentPersonaNotFound(context: ErrorContext) {
  return {
    _tag: "AiAgentPersonaNotFound",
    context,
  } as const satisfies BackendErrorSchema;
}

export function rateLimitExceeded(
  context: ErrorContext & { retryAfter: number; name: string }
) {
  return {
    _tag: "RateLimitExceeded",
    context,
  } as const satisfies BackendErrorSchema;
}

export function unknownError(context: ErrorContext) {
  return {
    _tag: "UnknownError",
    context,
  } as const satisfies BackendErrorSchema;
}

export function resendError(context: ErrorContext) {
  return {
    _tag: "ResendError",
    context,
  } as const satisfies BackendErrorSchema;
}

export function propogateConvexError(e: BackendErrorSchema): never {
  console.error(e);
  throw new ConvexError({
    _tag: e._tag,
    context: {
      message: e.context.message,
    },
  });
}

export function actionScheduleError(context: ErrorContext) {
  return {
    _tag: "ActionScheduleError",
    context,
  } as const satisfies BackendErrorSchema;
}
