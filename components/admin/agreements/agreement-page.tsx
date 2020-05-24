import { get, ApplicationError } from "../../fetch"
import Layout from "../layout";
import Link from "next/link";
import { Button } from "@material-ui/core";
import {
  AgreementDetails,
} from "./contracts"

import {
  AgreementView
} from "./agreement"
import { ErrorProps } from "../../common/error";
import { Component, ReactElement } from "react";
import Panel from "../../common/panel";


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
      this.setState({
        loading: false,
        details: data
      })
    }), (error: ApplicationError) => {
      this.handleError(error);
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
        } : undefined,
        dismiss: () => this.setState({error: undefined})
      }
    })
  }

  onUpdate(name: string, description: string): void {
    const details = this.state.details;

    if (details === null)
      throw new Error("Missing object in state");

    details.name = name;
    details.description = description
    this.setState({
      details
    })
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
            details={state.details}
          />
          }
        </Panel>
      </Layout>
    )
  }
}
