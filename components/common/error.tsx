import { Button } from "@material-ui/core";
import { Component, ReactElement } from "react";


export interface ErrorProps {
  title?: string
  message?: string
  className?: string
  status?: string
  retry?: () => void
}


export default class ErrorPanel extends Component<ErrorProps> {

  constructor(props: ErrorProps) {
    super(props);
  }

  render(): ReactElement {
    const props = this.props;
    const title = props.title || "Technical error";
    const message = props.message || "An unexpected error has occurred. " +
      "Please contact the service administrators if the problem persists.";

    const retry = props.retry;
    const className = props.className ? props.className : "error-panel";
    const status = props.status || "danger";

    return (<div className={className}>
              <div className={"alert alert-" + status}>
                <h2>{title}</h2>
                <p>{message}</p>
                {retry !== undefined
                  ? <Button
                  className="btn btn-default"
                  onClick={() => retry()}
                  variant="contained"
                  color="primary"
                  >Try again</Button>
                  : null}
              </div>
            </div>);
  }
}
