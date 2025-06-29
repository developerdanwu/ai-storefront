export function notAuthenticated(context?: string) {
  return {
    _tag: "NotAuthenticated",
    context,
  } as const;
}

export function userNotFound(context?: string) {
  return {
    _tag: "UserNotFound",
    context,
  } as const;
}
