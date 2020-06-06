import {Component, ReactElement} from "react";
import MarkdownIt from "markdown-it";

const mdParser = new MarkdownIt();

export interface ClaViewProps {
  body: string;
}

export default class ClaView extends Component<ClaViewProps> {
  render(): ReactElement {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: mdParser.render(this.props.body),
        }}
      ></div>
    );
  }
}
