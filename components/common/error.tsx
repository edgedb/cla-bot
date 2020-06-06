import ErrorOutline from "@material-ui/icons/ErrorOutline";
import HighlightOff from "@material-ui/icons/HighlightOff";
import {Button} from "@material-ui/core";
import {Component, ReactElement} from "react";

export interface ErrorProps {
  title?: string;
  message?: string;
  className?: string;
  status?: string;
  retry?: () => void;
  dismiss?: () => void;
}

export default class ErrorPanel extends Component<ErrorProps> {
  constructor(props: ErrorProps) {
    super(props);
  }

  dismiss(): void {
    if (this.props.dismiss) {
      this.props.dismiss();
    }
  }

  render(): ReactElement {
    const props = this.props;
    const title = props.title || "Technical error";
    const message =
      props.message ||
      "An unexpected error has occurred. " +
        "Please contact the service administrators if the problem persists.";

    const retry = props.retry;
    const className = props.className ? props.className : "alert-panel";
    const status = props.status || "error";

    return (
      <div className={className + " alert-" + status}>
        <div className={"alert"}>
          <div className="icon-wrapper">
            <ErrorOutline />
          </div>
          <h2>{title}</h2>
          {props.dismiss !== undefined && (
            <Button
              title="Dismiss"
              onClick={() => this.dismiss()}
              className="dismiss-btn"
            >
              <HighlightOff />
            </Button>
          )}
          <p>{message}</p>
          {retry !== undefined ? (
            <Button
              className="btn btn-default"
              onClick={() => retry()}
              color="secondary"
            >
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
}
