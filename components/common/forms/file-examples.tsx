import defer from "lodash/defer";
import React, {ChangeEvent, Component, ReactElement} from "react";
import {Select} from "@material-ui/core";

export interface FileExample {
  id: string;
  name: string;
  href: string;
}

export interface FileExamplesProps {
  items: FileExample[];
}

export interface FileExamplesState {
  selectedItem: FileExample | null;
}

export default class FileExamples extends Component<
  FileExamplesProps,
  FileExamplesState
> {
  private anchor: React.RefObject<HTMLAnchorElement>;

  constructor(props: FileExamplesProps) {
    super(props);

    this.state = {
      selectedItem: props.items[0] || null,
    };
    this.anchor = React.createRef();
  }

  onChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | {name?: string; value: unknown}
    >
  ): void {
    // user's interaction
    const id = event.target.value;
    const selectedItem =
      this.props.items.find((item) => item.id === id) || null;
    this.setState({
      selectedItem,
    });

    defer(() => {
      this.anchor.current?.click();
    });
  }

  render(): ReactElement {
    const {items} = this.props;
    const {selectedItem} = this.state;

    return (
      <div className="file-example-select">
        <Select
          native
          value={selectedItem?.id}
          onChange={this.onChange.bind(this)}
        >
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        {selectedItem && (
          <a
            href={selectedItem.href}
            download
            ref={this.anchor}
            className="download-link"
          >
            download...
          </a>
        )}
      </div>
    );
  }
}
