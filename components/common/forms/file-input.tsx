import React, {Component, ReactElement} from "react";
import Description from "@material-ui/icons/Description";
import HighlightOff from "@material-ui/icons/HighlightOff";
import {Button} from "@material-ui/core";

export interface FileInputProps {
  name: string;
  label?: string;
  accept?: string;
  disabled?: boolean;
  onSelect: (file: File | null) => void;
}

interface FileInputState {
  selectedFile?: File;
}

export default class FileInput extends Component<
  FileInputProps,
  FileInputState
> {
  private input: React.RefObject<HTMLInputElement>;

  constructor(props: FileInputProps) {
    super(props);

    this.state = {};
    this.input = React.createRef();
  }

  onClick(event: React.MouseEvent<HTMLInputElement>): void {
    if (this.props.disabled) {
      event.preventDefault();
      return;
    }
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>): void {
    if (this.props.disabled) {
      event.preventDefault();
      return;
    }
    const target = event.target;

    if (target.files && target.files.length) {
      const file = target.files[0];

      this.setState({
        selectedFile: file,
      });
      this.props.onSelect(file);
    }
  }

  clearSelection(): void {
    if (this.props.disabled) {
      return;
    }
    // This is always tricky about input of file type:
    if (this.input.current) this.input.current.value = "";

    this.setState({
      selectedFile: undefined,
    });
    this.props.onSelect(null);
  }

  render(): ReactElement {
    const {name, label, accept, disabled} = this.props;
    const {selectedFile} = this.state;

    return (
      <div
        className={
          "file-input MuiInputBase-input MuiOutlinedInput-input" +
          (disabled ? " ui-disabled" : "")
        }
      >
        <label className="file-select">
          <Description />
          <input
            type="file"
            name={name}
            accept={accept}
            onClick={this.onClick.bind(this)}
            onChange={this.onChange.bind(this)}
            ref={this.input}
          />
          {label || (selectedFile ? selectedFile.name : "Select a file...")}
        </label>
        {selectedFile && (
          <Button
            onClick={() => this.clearSelection()}
            className="clear small"
          >
            <HighlightOff />
          </Button>
        )}
      </div>
    );
  }
}
