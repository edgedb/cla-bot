import {ApplicationError} from "./fetch";
import {ErrorProps} from "./common/error";

function mapApplicationErrorToErrorProps(error: ApplicationError): ErrorProps {
  // TODO: map server side errors to proper errors visualizations
  throw new Error("Not implemented error");
}
