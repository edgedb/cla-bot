import fetch from "cross-fetch";
import Layout from "../../../components/admin/layout";
import Link from "next/link";
import { Button } from "@material-ui/core";
import { ReactElement, Component } from "react";
import { ErrorProps } from "../../../components/common/error";
import Panel from "../../../components/common/panel";
import { withRouter } from 'next/router'
import { WithRouterProps } from "next/dist/client/with-router";
import Preloader from "../../../components/common/preloader";
import {
  AgreementDetails,
} from "../../../components/admin/agreements/contracts"

import {
  AgreementDetailsView
} from "../../../components/admin/agreements/agreement"


interface AgreementDetailsPageProps {
  id: string
}


export interface AgreementDetailsState {
  error?: ErrorProps
  loading: boolean
  details: AgreementDetails | null
}


class AgreementDetailsPage
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
    })).catch(reason => {
      this.setState({
        loading: false,
        error: {
          retry: () => {
            this.load();
          }
        }
      })
    });
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


function Page({ router }: WithRouterProps): ReactElement {
  const agreementId = router.query.id

  if (typeof agreementId !== "string") {
    // For some reason, the router query parameters are only
    // populated when the code executes on the client.
    // This doesn't look logical, since the route parameter is in the URL,
    // which is of course parsed and used by the server side.
    // Since we don't care about SEO here, return a preloader if the route
    // is not available.
    return <Preloader className="overlay" />
  }

  return <AgreementDetailsPage id={agreementId} />
}

export default withRouter(Page)
