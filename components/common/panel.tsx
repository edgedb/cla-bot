/**
 * Common component for loadable partial view,
 * with support for loading / error views.
 */
import { Component, ReactElement } from "react";
import Preloader from "./preloader";
import ErrorPanel, { ErrorProps } from "./error";


export interface PanelProps {
  id?: string
  loading: boolean
  error?: ErrorProps
  load?: () => void
  retry?: () => void
}


export default class Panel extends Component<PanelProps> {

  constructor(props: PanelProps) {
    super(props);
  }

  render(): ReactElement {
    const props = this.props
    const error = props.error

    if (props.loading && !error) {
      // enable automatic loading
      if (props.load) {
        props.load();
      }
      return <Preloader />;
    }

    if (error) {
      return <ErrorPanel
      title={error.title}
      message={error.message}
      retry={props.retry || props.load}
      />;
    }

    return (<div id={props.id}>{props.children}</div>);
  }
}
