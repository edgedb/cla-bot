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
}


export default class Panel extends Component<PanelProps> {

  constructor(props: PanelProps) {
    super(props);
  }

  componentDidMount(): void {
    const props = this.props;
    if (props.loading && !props.error)
    {
      // enable automatic loading
      if (props.load) {
        props.load();
      }
    }
  }

  render(): ReactElement {
    const props = this.props
    const error = props.error

    if (props.loading && !error) {
      return <Preloader />;
    }

    if (error) {
      return <ErrorPanel {...error} />;
    }

    return (<div id={props.id}>{props.children}</div>);
  }
}
