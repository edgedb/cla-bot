import Layout from "../../components/admin/layout";
import Panel from "../../components/common/panel";
import { ErrorProps } from "../../components/common/error";
import { Component, ReactElement } from "react";


export interface RepositoriesProps {
  foo?: boolean
}


export interface RepositoriesState {
  error?: ErrorProps
  loading: boolean
}


export default class Repositories
extends Component<RepositoriesProps, RepositoriesState> {

  constructor(props: RepositoriesProps) {
    super(props);

    this.state = {
      loading: true,
      error: undefined
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined
      })
    }

    // TODO: make a web request to fetch the list of repositories

    setTimeout(() => {
      // simulate error
      this.setState({
        loading: false,
        error: {
          retry: () => {
            this.load();
          }
        }
      })
    }, 1000)
  }

  componentWillUnmount(): void {
    // TODO: cancel pending tasks, if any
  }

  render(): ReactElement {
    const state = this.state;

    return (
      <Layout title="Repositories">
        <Panel
          id="repositories-list"
          error={state.error}
          load={this.load.bind(this)}
          loading={state.loading}
        >
          <h1>Repositories</h1>
        </Panel>
      </Layout>
    )
  }
}
