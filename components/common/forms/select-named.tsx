import React, {Component, ReactElement, ChangeEvent} from "react";
import Select from "@material-ui/core/Select";
import {changeHandler} from "../../forms";

export interface NamedItem {
  id: string;
  name: string;
}

export interface SelectProps<T> {
  items: T[];
  onSelect: (item: T | null) => void;
  disallowEmpty?: true;
  initialValue?: string;
  disabled?: boolean;
}

interface SelectState {
  selectedItemId: string;
}

/**
 * Generic component to select a single item in an HTML select.
 * Items are given as props.
 */
export default class NamedSelect<T extends NamedItem> extends Component<
  SelectProps<T>,
  SelectState
> {
  constructor(props: SelectProps<T>) {
    super(props);

    this.state = {
      selectedItemId: props.initialValue || "",
    };
  }

  getSelectedItem(): T | null {
    const item = this.props.items.find(
      (obj) => obj.id === this.state.selectedItemId
    );

    if (!item) {
      // the user selected the empty option
      return null;
    }

    return item;
  }

  onChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | {name?: string; value: unknown}
    >
  ): void {
    // user's interaction
    changeHandler.call(this, event);

    setTimeout(() => {
      this.props.onSelect(this.getSelectedItem());
    }, 0);
  }

  render(): ReactElement {
    const {disabled, items, disallowEmpty} = this.props;
    const {selectedItemId} = this.state;

    if (items.length === 0) {
      return <i>...</i>;
    }

    // Note: if items contain a single element, then select it automatically
    if (items.length === 1) {
      const singleItem = items[0];
      return <i>{singleItem.name}</i>;
    }

    return (
      <Select
        native
        value={selectedItemId}
        name="selectedItemId"
        onChange={this.onChange.bind(this)}
        disabled={disabled}
      >
        {!disallowEmpty && <option key="" value=""></option>}
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </Select>
    );
  }
}
