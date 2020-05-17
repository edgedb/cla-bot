import fetch from "cross-fetch";
import Layout from "../../../components/admin/layout";
import Panel from "../../../components/common/panel";
import { ErrorProps } from "../../../components/common/error";
import { Component, ReactElement } from "react";
import { Link } from "@material-ui/core";


interface AgreementsInfo {
  id: string
  name: string,
  description: string
}


export interface AgreementsState {
  error?: ErrorProps
  loading: boolean,
  items: AgreementsInfo[] | null
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
          items: data as AgreementsInfo[]
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

  componentWillUnmount(): void {
    // TODO: cancel pending tasks, if any
  }

  renderList(): ReactElement | ReactElement[] | null {
    const items = this.state.items;

    if (items === null)
      return null;

    if (items.length === 0)
      return <p>There are no configured agreements.</p>

    return <table>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Description</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      {
      items.map((item, index) => {
        return <tr key={item.id}>
          <td>{index + 1}</td>
          <td>{item.name}</td>
          <td>{item.description}</td>
          <td>...</td>
          <td></td>
        </tr>
      })
      }
      </tbody>
      </table>;
  }

  add(): void {
    console.log("Add new agreement!");
  }

  render(): ReactElement {
    const state = this.state;

    // TODO: display a list of repositories

    return (
      <Layout title="Agreements">
        <Panel
          id="agreements-list"
          error={state.error}
          load={this.load.bind(this)}
          loading={state.loading}
        >
          <h1>Agreements</h1>
          {this.renderList()}

          <hr />
          <div className="buttons-area">
            <Link
            color="primary"
            href="/admin/new-agreement"
            >
              Add
            </Link>
          </div>
        </Panel>
      </Layout>
    )
  }
}
