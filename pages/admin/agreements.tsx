import fetch from "cross-fetch";
import Layout from "../../components/admin/layout";
import Panel from "../../components/common/panel";
import { ErrorProps } from "../../components/common/error";
import { Component, ReactElement } from "react";
import Link from "next/link";
import { Button } from "@material-ui/core";
import { AgreementsTableItem }
from "../../components/admin/agreements/contracts";
import { AgreementsTable }
from "../../components/admin/agreements/agreements-table";


export interface AgreementsState {
  error?: ErrorProps
  loading: boolean,
  items: AgreementsTableItem[] | null
}


export default class Agreements
extends Component<{}, AgreementsState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      loading: true,
      error: undefined,
      items: null
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined
      })
    }

    fetch("/api/agreements").then((response => {
      response.json().then(data => {
        this.setState({
          loading: false,
          items: data as AgreementsTableItem[]
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

  render(): ReactElement {
    const state = this.state;

    return (
      <Layout title="Agreements">
        <Panel
          id="agreements-table"
          error={state.error}
          load={this.load.bind(this)}
          loading={state.loading}
        >
          <h1>Agreements</h1>
          {state.items !== null &&
          <AgreementsTable items={state.items} />
          }
          <div className="buttons-area">
            <Link href="/admin/new-agreement">
              <Button
                type="button"
                variant="contained"
                color="primary"
              >
                Create new agreement
              </Button>
            </Link>
          </div>
        </Panel>
      </Layout>
    )
  }
}
