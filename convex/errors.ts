export type BackendError = {
  _tag: string;
  context: ErrorContext;
};

type ErrorContext = {
  message: string;
  error?: unknown;
  [key: string]: any;
};

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
