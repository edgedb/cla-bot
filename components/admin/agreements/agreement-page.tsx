import { get, ApplicationError } from "../../fetch"
import Layout from "../layout";
import {
  AgreementDetails,
} from "./contracts"
import {
  AgreementView
} from "./agreement"
import { ErrorProps } from "../../common/error";
import { Component, ReactElement } from "react";
import Panel from "../../common/panel";
import { AgreementVersion } from "./contracts";


interface AgreementDetailsPageProps {
  id: string
}


export interface AgreementDetailsState {
  error?: ErrorProps
  loading: boolean
  details: AgreementDetails | null
}


export default class AgreementDetailsPage
extends Component<AgreementDetailsPageProps, AgreementDetailsState> {

  constructor(props: AgreementDetailsPageProps) {
    super(props)

    this.state = {
      error: undefined,
      loading: true,
      details: null
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined
      })
    }

    get<AgreementDetails>(`/api/agreements/${this.props.id}`)
    .then((data => {
      this.sortVersions(data);

      this.setState({
        loading: false,
        details: data
      })
    }), (error: ApplicationError) => {
      this.handleError(error);
    });
  }

  sortVersions(data: AgreementDetails): void {
    data.versions.sort((a, b) => {
      // Always display the current version on the top
      if (a.current) return -1;
      if (b.current) return 1;

      return new Date(a.creationTime) < new Date(b.creationTime) ? 1 : -1;
    });
  }

  handleError(error: ApplicationError): void {
    this.setState({
      loading: false,
      error: {
        // TODO: how to handle user friendly error titles and messages?
        // title: error.message,
        // message: error.message,
        retry: error.allowRetry() ? () => {
          this.load();
        } : undefined
      }
    })
  }

  onUpdate(name: string, description: string): void {
    const details = this.state.details;

    if (details === null)
      throw new Error("Missing object in state");

    details.name = name;
    details.description = description
    this.setState({ details })
  }

  onCompleted(version: AgreementVersion): void {
    const details = this.state.details;

    if (details === undefined) {
      // should never happen
      return;
    }

    version.draft = false;
    this.setState({ details });
  }

  onMakeCurrent(version: AgreementVersion): void {
    const details = this.state.details;

    if (details === undefined) {
      // should never happen
      return;
    }

    details?.versions.forEach(item => {
      item.current = (version === item);
    })

    this.setState({ details });
  }

  onNewVersion(): void {
    // For simplicity, when a new agreement version is created,
    // we force a reload of the whole Agreement object.
    // It would also be possible to return information from the server,
    // and append this information to the existing items (???)
    this.load();
  }

  render(): ReactElement {
    const state = this.state;
    return (
      <Layout title="Agreement details">
        <Panel
          id="agreement-details"
          error={state.error}
          load={() => this.load()}
          loading={state.loading}
        >
          <h1>Agreement details</h1>
          {state.details &&
          <AgreementView
            onUpdate={this.onUpdate.bind(this)}
            onNewVersion={this.onNewVersion.bind(this)}
            onCompleted={this.onCompleted.bind(this)}
            onMakeCurrent={this.onMakeCurrent.bind(this)}
            details={state.details}
          />
          }
        </Panel>
      </Layout>
    )
  }
}
