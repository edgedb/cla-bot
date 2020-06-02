import { Component, ReactElement } from "react";


export interface PreloaderProps {
  id?: string
  className?: string
}


export default class Preloader extends Component<PreloaderProps> {
  constructor(props: PreloaderProps) {
    super(props)
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
