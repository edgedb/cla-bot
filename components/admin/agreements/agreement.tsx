import { Component, ReactElement } from "react";
import { AgreementDetails, AgreementVersion } from "./contracts";
import { VersionsTable } from "./versions-table";
import Link from "next/link";


export interface AgreementDetailsProps {
  details: AgreementDetails
}


export class AgreementDetailsView extends Component<AgreementDetailsProps> {

  constructor(props: AgreementDetailsProps) {
    super(props);
  }

  render(): ReactElement {
    const details = this.props.details;

    return <div>
      <dl className="inline">
        <dt>Id</dt>
        <dd>{details.id}</dd>
        <dt>Name</dt>
        <dd>{details.name}</dd>
        <dt>Description</dt>
        <dd>{details.description}</dd>
      </dl>
      <div className="versions-region region">
        <h2>Versions</h2>
        <VersionsTable items={details.versions} />
      </div>
    </div>
  }
}
