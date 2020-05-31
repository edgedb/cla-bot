import ConfirmDialog, { ConfirmDialogProps, closedDialog }
from "../../common/confirm-dialog";
import Layout from "../layout";
import Link from "next/link";
import Panel from "../../common/panel";
import { Button } from "@material-ui/core";
import { Component, ReactElement } from "react";
import { ErrorProps } from "../../common/error";
import { get, del } from "../../fetch";
import { AdministratorsTable } from "./administrators-table";
import { Administrator } from "./contracts";
import ArrayUtils from "../../array";
import Preloader from "../../common/preloader";


interface AdministratorsPageProps {
  error?: ErrorProps
  loading: boolean,
  waiting: boolean,
  administrators: Administrator[]
  confirm: ConfirmDialogProps
}


export default class AdministratorsPage
extends Component<{}, AdministratorsPageProps> {

  constructor(props: {}) {
    super(props);

    this.state = {
      loading: true,
      waiting: false,
      error: undefined,
      administrators: [],
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

    get<Administrator[]>("/api/administrators").then(
      administrators => {
        this.setState({
          loading: false,
          administrators
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

  onRemoveClick(item: Administrator): void {
    this.setState({
      confirm: {
        open: true,
        title: `Remove administrator "${item.email}"?`,
        description:
        "If confirmed, this administrator won`t be able to login anymore. ",
        close: () => this.dismissDialog(),
        confirm: () => this.remove(item)
      }
    })
  }

  remove(item: Administrator): void {
    this.setState({
      waiting: true
    });

    del(`/api/administrators/${item.id}`)
    .then(() => {
      ArrayUtils.remove(this.state.administrators, item);
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
          error={state.error}
          load={this.load.bind(this)}
          loading={state.loading}
        >
          <h1>Configured Repositories</h1>
          <AdministratorsTable
            items={state.administrators}
            onRemove={this.onRemoveClick.bind(this)}
          />
          <div className="buttons-area">
            <Link href="/admin/administratos/new">
              <Button
                type="button"
              >
                Add new administrator
              </Button>
            </Link>
          </div>
        </Panel>
        <ConfirmDialog {...state.confirm} />
      </Layout>
    )
  }
}
