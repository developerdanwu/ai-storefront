import { BackendErrorSchema } from "../errors";

type AgentToolSuccess<T> = {
  success: true;
  value: T;
};

type AgentToolError = {
  success: false;
  error: BackendErrorSchema;
};

type AgentToolResult<T> = AgentToolSuccess<T> | AgentToolError;

function agentSuccess<T>(x: T): AgentToolSuccess<T> {
  return {
    success: true,
    value: x,
  };
}

function agentError<T>(error: BackendErrorSchema): AgentToolError {
  return {
    success: false,
    error,
  };
}
