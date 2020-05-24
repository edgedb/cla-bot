import fetch from "cross-fetch";
import Layout from "../../components/admin/layout";
import Panel from "../../components/common/panel";
import { ErrorProps } from "../../components/common/error";
import { Component, ReactElement } from "react";
import { Button } from "@material-ui/core";


interface RepositoryInfo {
  id: string
  fullName: string,
  agreementId: string
}


interface RepositoriesState {
  error?: ErrorProps
  loading: boolean,
  items: RepositoryInfo[] | null
}


export default class Repositories
extends Component<{}, RepositoriesState> {

  private _isMounted: boolean

  constructor(props: {}) {
    super(props);

    this.state = {
      loading: true,
      error: undefined,
      items: null
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined
      })
    }

    fetch("/api/repositories").then((response => {
      if (response.status !== 200) {
        // TODO: put this code in a common place, use interface to achieve DRY
        response.text().then(text => {
          this.setState({
            loading: false,
            error: {
              message: text,
              retry: () => {
                this.load();
              }
            }
          })
        })

        return;
      }
      response.json().then(data => {
        if (!this._isMounted) // TODO: how to handle this in a smart way?
          return;
        this.setState({
          loading: false,
          items: data as RepositoryInfo[]
        })
      })
    })).catch(() => {
      if (!this._isMounted)
        return;
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

  renderList(): ReactElement | ReactElement[] | null {
    const items = this.state.items;

    if (items === null)
      return null;

    if (items.length === 0)
      return <p>There are no configured repositories.</p>

    return <table>
      <thead>
        <tr>
          <th></th>
          <th>Full name</th>
          <th>Agreement name</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      {
      items.map((item, index) => {
        return <tr key={item.id}>
          <td>{index + 1}</td>
          <td>{item.fullName}</td>
          <td>...</td>
          <td></td>
        </tr>
      })
      }
      </tbody>
      </table>;
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
          <h1>Configured Repositories</h1>
          {this.renderList()}
          <div className="buttons-area">
            <Button>
              Add new configuration
            </Button>
          </div>
        </Panel>
      </Layout>
    )
  }
}
