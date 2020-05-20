import formatDate from "../../format-date";
import Star from "@material-ui/icons/Star";
import StarBorder from "@material-ui/icons/StarBorder";
import DescriptionOutlined from "@material-ui/icons/DescriptionOutlined";
import { AgreementVersion } from "./contracts";
import { Component, ReactElement } from "react";
import Link from "next/link";


export interface VersionProps {
  versionId: string
}


export class Version extends Component<VersionProps> {

  constructor(props: VersionProps) {
    super(props);
  }

  render(): ReactElement {
    return <div>
      <h2>{this.props.versionId}</h2>
    </div>
  }
}
