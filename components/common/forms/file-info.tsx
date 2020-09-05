import React, {Component, ReactElement} from "react";
import {formatBytes} from "../bytes";
import formatDate from "../../format-date";

// Ref: HTML5 File API
export interface FileInfoProps {
  lastModified: number;
  name: string;
  size: number;
  type: string;
}

export default class FileInfo extends Component<FileInfoProps> {
  render(): ReactElement {
    const {lastModified, name, size, type} = this.props;

    return (
      <div className="file-info">
        <span className="file-name">{name}</span>
        <span className="file-type">({type})</span>
        <span className="file-size">{formatBytes(size)}</span>
        <span className="last-modified-time">
          Last modified at:&nbsp;
          {formatDate(lastModified)}
        </span>
      </div>
    );
  }
}
