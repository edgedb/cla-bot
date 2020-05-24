import { AgreementVersion } from "./contracts";
import { Component, ReactElement } from "react";
import { VersionText } from "./version-text";


export interface VersionProps {
  details: AgreementVersion
}


export interface VersionState {
  editing: boolean
}


export class Version extends Component<VersionProps, VersionState> {

  constructor(props: VersionProps) {
    super(props);
  }

  render(): ReactElement {
    const details = this.props.details;
    // TODO: add buttons to confirm this version
    return <div>
      <VersionText
        id={details.id}
        culture="en"
        draft={details.draft}
        />
    </div>
  }
}
