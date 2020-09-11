import {Administrator} from "./contracts";
import {Component, ReactElement} from "react";
import HighlightOff from "@material-ui/icons/HighlightOff";
import {Button} from "@material-ui/core";
import React from "react";

export interface AdministratorsTableProps {
  items: Administrator[];
  onRemove: (item: Administrator) => void;
}

export class AdministratorsTable extends Component<AdministratorsTableProps> {
  render(): ReactElement {
    const items = this.props.items;

    if (!items.length) {
      // CLA specific administrators are not required
      return <React.Fragment></React.Fragment>;
    }

    return (
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            return (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.email}</td>
                <td className="actions">
                  <Button
                    title="Remove administrator"
                    onClick={() => this.props.onRemove(item)}
                  >
                    <HighlightOff />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}
