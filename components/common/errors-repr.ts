import {AlertSeverity} from "./alert";
import {ApplicationError} from "../errors";

export interface ErrorRepresentation {
  title: string;
  message: string;
  severity: AlertSeverity;
}

const TechnicalError = {
  title: "Technical error",
  message:
    "An unexpected error has occurred. " +
    "Please contact the service administrators if the problem persists.",
  severity: AlertSeverity.error,
};

/**
 * Maps an instance of ApplicationError to an object that describes it.
 */
export function reprError(error: ApplicationError): ErrorRepresentation {
  if (!(error instanceof ApplicationError)) {
    // this can happen in TypeScript;
    // caught exceptions are `any` and it is comfortable to handle any
    // exception here, even when we think we should receive a specific type
    return TechnicalError;
  }

  switch (error.status) {
    case 202:
      return {
        title: error.title || "Accepted",
        message:
          error.message ||
          "The operation has been accepted for processing, " +
            "but it has not been completed.",
        severity: AlertSeverity.info,
      };
    case 419: // custom
      return {
        title: error.title || "Warning",
        message: error.message,
        severity: AlertSeverity.warning,
      };
    case 404:
      return {
        title: error.title || "Object not found",
        message: error.message,
        severity: AlertSeverity.warning,
      };
    case 400:
      return {
        title: error.title || "Bad Request",
        message: error.message || "The request could not be processed.",
        severity: AlertSeverity.warning,
      };
    case 401:
      return {
        title: error.title || "Unauthorized",
        message: error.message || "Your session might have expired.",
        severity: AlertSeverity.warning,
      };
    case 403:
      return {
        title: error.title || "Forbidden",
        message:
          error.message ||
          "You are not authorized to complete the requested operation.",
        severity: AlertSeverity.warning,
      };
    case 409:
      return {
        title: error.title || "Conflict",
        message:
          error.message ||
          "You are not authorized to complete the requested operation.",
        severity: AlertSeverity.warning,
      };
    default:
      return TechnicalError;
  }
}
