import ConfirmDialog, { ConfirmDialogProps, closedDialog }
from "../../common/confirm-dialog";
import Layout from "../layout";
import Link from "next/link";
import Panel from "../../common/panel";
import { AgreementListItem } from "../agreements/contracts";
import { Button } from "@material-ui/core";
import { Component, ReactElement } from "react";
import { ErrorProps } from "../../common/error";
import { get, del } from "../../fetch";
import { RepositoriesTable } from "./repositories-table";
import { Repository } from "./contracts";
import ArrayUtils from "../../array";
import Preloader from "../../common/preloader";


interface RepositoriesState {
  error?: ErrorProps
  loading: boolean,
  waiting: boolean,
  repositories: Repository[]
  confirm: ConfirmDialogProps
}


export default class Repositories
extends Component<{}, RepositoriesState> {

  constructor(props: {}) {
    super(props);

    this.state = {
      loading: true,
      waiting: false,
      error: undefined,
      repositories: [],
      confirm: closedDialog()
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined
      })
    }

    get<Repository[]>("/api/repositories").then(
      items => {
        this.setState({
          loading: false,
          repositories: items
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

  dismissDialog(): void {
    const dialog = this.state.confirm;
    dialog.open = false
    this.setState({
      waiting: false,
      confirm: dialog
    })
  }

  addErrorToDialog(): void {
    const dialog = this.state.confirm;
    dialog.error = {};
    this.setState({
      waiting: false,
      confirm: dialog
    })
  }

  onRemoveClick(item: Repository): void {
    this.setState({
      confirm: {
        open: true,
        title: `Remove the binding for "${item.fullName}"?`,
        description:
        "If confirmed, this repository - agreement binding will be removed. " +
        `Later it is possible to create a new binding for "${item.fullName}".`,
        close: () => this.dismissDialog(),
        confirm: () => this.remove(item)
      }
    })
  }

  remove(item: Repository): void {
    this.setState({
      waiting: true
    });

    del(`/api/repositories/${item.id}`)
    .then(() => {
      ArrayUtils.remove(this.state.repositories, item);
      this.dismissDialog();
    }, () => {
      this.addErrorToDialog();
    });
  }

  render(): ReactElement {
    const state = this.state;

    return (
      <Layout title="Repositories">
        {state.waiting && <Preloader className="overlay" />}
        <Panel
          id="repositories-list"
          error={state.error}
          load={this.load.bind(this)}
          loading={state.loading}
        >
          <h1>Configured Repositories</h1>
          <RepositoriesTable
            items={state.repositories}
            onRemove={this.onRemoveClick.bind(this)}
          />
          <div className="buttons-area">
            <Link href="/admin/repositories/new">
              <Button
                type="button"
              >
                Add new configuration
              </Button>
            </Link>
          </div>
        </Panel>
        <ConfirmDialog {...state.confirm} />
      </Layout>
    )
  }
}
