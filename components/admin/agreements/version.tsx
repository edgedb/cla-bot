import formatDate from "../../format-date";
import Star from "@material-ui/icons/Star";
import StarBorder from "@material-ui/icons/StarBorder";
import DescriptionOutlined from "@material-ui/icons/DescriptionOutlined";
import { AgreementVersion } from "./contracts";
import { Component, ReactElement } from "react";
import Link from "next/link";
import Panel from "../../common/panel";
import { ErrorProps } from "../../common/error";
import { DetailsView } from "../details-view";
import ifetch from "../../fetch";


export interface VersionProps {
  versionId: string
}


export interface VersionState {
  details?: AgreementVersion
}


export class Version extends Component<VersionProps, VersionState> {

  constructor(props: VersionProps) {
    super(props);

    this.state = {
      details: undefined
    }
  }

  async fetchData(): Promise<void> {
    const data = await ifetch<AgreementVersion>(
      `/api/agreement-version/${this.props.versionId}`
    )

    this.setState({
      details: data
    })
  }

  render(): ReactElement {
    const details = this.state.details;
    return <div>
      <DetailsView fetchData={async () => await this.fetchData()}>
        {details &&
        <dl className="inline">
          <dt>Id</dt>
          <dd>{details.id}</dd>
        </dl>
        }
      </DetailsView>
    </div>
  }
}
