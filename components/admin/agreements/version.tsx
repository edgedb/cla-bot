import formatDate from "../../format-date";
import { AgreementVersion } from "./contracts";
import { Component, ReactElement } from "react";
import ifetch from "../../fetch";


export interface VersionProps {
  details: AgreementVersion
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
      `/api/agreement-version/${this.props.details.id}`
    )

    this.setState({
      details: data
    })
  }

  render(): ReactElement {
    const details = this.props.details;
    return <div>
      <dl className="inline">
        <dt>Id</dt>
        <dd>{details.id}</dd>
        <dt>Number</dt>
        <dd>{details.number}</dd>
        <dt>Created at</dt>
        <dd>{formatDate(details.creationTime)}</dd>
      </dl>
    </div>
  }
}
