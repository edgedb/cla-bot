import fetch from "cross-fetch";
import Layout from "../../../components/admin/layout";
import Link from "next/link";
import { Button } from "@material-ui/core";
import {
  AgreementDetails,
} from "./contracts"

import {
  AgreementDetailsView
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

    fetch(`/api/agreements/${this.props.id}`).then((response => {
      response.json().then(data => {
        this.setState({
          loading: false,
          details: data as AgreementDetails
        })
      })
    }), () => {
      this.handleError();
    }).catch(reason => {
      this.handleError();
    });
  }

  handleError(): void {
    this.setState({
      loading: false,
      error: {
        retry: () => {
          this.load();
        }
      }
    })
  }

  update(name: string, description: string): void {
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
          <AgreementDetailsView
          update={this.update.bind(this)}
          details={state.details}
          />
          }
          <Link href="/admin/agreements">
            <Button
              type="button"
              variant="contained"
              color="primary"
            >
              Back to list
            </Button>
          </Link>
        </Panel>
      </Layout>
    )
  }
}
