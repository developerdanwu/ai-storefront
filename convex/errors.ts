export type BackendError = {
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

export type CreateThreadFailed = ReturnType<typeof createThreadFailed>;

export function notAuthenticated(context: ErrorContext) {
  return {
    _tag: "NotAuthenticated",
    context,
  } as const satisfies BackendError;
}

export function userNotFound(context: ErrorContext) {
  return {
    _tag: "UserNotFound",
    context,
  } as const satisfies BackendError;
}

export function summaryGenerationFailed(context: ErrorContext) {
  return {
    _tag: "SummaryGenerationFailed",
    context,
  } as const satisfies BackendError;
}

export function createThreadFailed(context: ErrorContext) {
  return {
    _tag: "CreateThreadFailed",
    context,
  } as const satisfies BackendError;
}

export function generateAiTextFailed(context: ErrorContext) {
  return {
    _tag: "GenerateAiTextFailed",
    context,
  } as const satisfies BackendError;
}

export function sendAiMessageFailed(context: ErrorContext) {
  return {
    _tag: "SendAiMessageFailed",
    context,
  } as const satisfies BackendError;
}

export function getAiThreadsFailed(context: ErrorContext) {
  return {
    _tag: "GetAiThreadsFailed",
    context,
  } as const satisfies BackendError;
}

export function getAiThreadMessagesFailed(context: ErrorContext) {
  return {
    _tag: "GetAiThreadMessagesFailed",
    context,
  } as const satisfies BackendError;
}

export function userAlreadyAuthenticated(context: ErrorContext) {
  return {
    _tag: "UserAlreadyAuthenticated",
    context,
  } as const satisfies BackendError;
}

export function accessingAuthedMaterialAsAnonymousUser(context: ErrorContext) {
  return {
    _tag: "AccessingAuthedMaterialAsAnonymousUser",
    context,
  } as const satisfies BackendError;
}

export function failedToCreateUser(context: ErrorContext) {
  return {
    _tag: "FailedToCreateUser",
    context,
  } as const satisfies BackendError;
}

export function threadMigrationFailed(context: ErrorContext) {
  return {
    _tag: "ThreadMigrationFailed",
    context,
  } as const satisfies BackendError;
}

export function continueThreadFailed(context: ErrorContext) {
  return {
    _tag: "ContinueThreadFailed",
    context,
  } as const satisfies BackendError;
}

export function aiThreadNotFound(context: ErrorContext) {
  return {
    _tag: "AiThreadNotFound",
    context,
  } as const satisfies BackendError;
}

export function aiToolFailure(context: ErrorContext) {
  return {
    _tag: "AiToolFailure",
    context,
  } as const satisfies BackendError;
}

export function getAiProfilePictureFailed(context: ErrorContext) {
  return {
    _tag: "GetAiProfilePictureFailed",
    context,
  } as const satisfies BackendError;
}
