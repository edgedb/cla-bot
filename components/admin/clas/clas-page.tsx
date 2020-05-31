import Layout from "../layout";
import Panel from "../../common/panel";
import { Component, ReactElement } from "react";
import { get } from "../../fetch";
import { ErrorProps } from "../../common/error";
import { ClasTable } from "./clas-table";
import { ContributorLicenseAgreement } from "./contracts";


interface ClasState {
  page: number
  error?: ErrorProps
  loading: boolean
  clas: ContributorLicenseAgreement[]
}


export default class Repositories
extends Component<{}, ClasState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      page: 1,
      loading: true,
      error: undefined,
      clas: []
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined
      })
    }
    const { page } = this.state;

    get<ClasTable[]>(`/api/clas?page=${page}`).then(
      items => {
        this.setState({
          loading: false
        })
      },
      () => {
        this.setState({
          loading: false,
          error: {
            retry: () => {
              this.load();
            }
          }
        })
      }
    )
  }

  render(): ReactElement {
    const state = this.state;

    return (
      <Layout title="Repositories">
        <Panel
          error={state.error}
          load={this.load.bind(this)}
          loading={state.loading}
        >
          <h1>Configured repositories</h1>
          <ClasTable
            items={state.clas}
          />
        </Panel>
      </Layout>
    )
  }
}
