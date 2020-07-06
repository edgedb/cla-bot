import {Component, ReactElement} from "react";

export interface LoaderProps {
  id?: string;
  className?: string;
}

export default class Loader extends Component<LoaderProps> {
  constructor(props: LoaderProps) {
    super(props);
  }

  render(): ReactElement {
    const props = this.props;
    const className = props.className;
    return (
      <div
        id={props.id}
        className={"preloader-mask" + (className ? " " + className : "")}
      >
        <div className="preloader-icon"></div>
      </div>
    );
  }
}
