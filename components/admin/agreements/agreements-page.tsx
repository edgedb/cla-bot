import {get} from "../../fetch";
import Layout from "../layout";
import Panel from "../../common/panel";
import {Component, ReactElement} from "react";
import Link from "next/link";
import {Button} from "@material-ui/core";
import {AgreementListItem} from "./contracts";
import {AgreementsTable} from "./agreements-table";
import {ApplicationError} from "../../errors";

export interface AgreementsPageState {
  error?: ApplicationError;
  loading: boolean;
  items: AgreementListItem[] | null;
}

export default class AgreementsPage extends Component<
  {},
  AgreementsPageState
> {
  constructor(props: {}) {
    super(props);

    this.state = {
      loading: true,
      error: undefined,
      items: null,
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined,
      });
    }

    get<AgreementListItem[]>("/api/agreements").then(
      (data) => {
        this.setState({
          loading: false,
          items: data,
        });
      },
      (error: ApplicationError) => {
        this.setState({
          loading: false,
          error,
        });
      }
    );
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
          {state.items !== null && <AgreementsTable items={state.items} />}
          <div className="buttons-area">
            <Link href="/admin/agreements/new">
              <Button type="button" variant="outlined" color="primary">
                Create new agreement
              </Button>
            </Link>
          </div>
        </Panel>
      </Layout>
    );
  }
}
