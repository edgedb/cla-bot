import ConfirmDialog, {
  ConfirmDialogProps,
  closedDialog,
} from "../../common/confirm-dialog";
import Layout from "../layout";
import Panel from "../../common/panel";
import {Component, ReactElement} from "react";
import {get, del} from "../../fetch";
import {AdministratorsTable} from "./administrators-table";
import {Administrator} from "./contracts";
import ArrayUtils from "../../array";
import Loader from "../../common/loader";
import NewAdministratorForm from "./administrator-new";
import {ApplicationError} from "../../errors";

interface AdministratorsPageState {
  error?: ApplicationError;
  loading: boolean;
  waiting: boolean;
  administrators: Administrator[];
  confirm: ConfirmDialogProps;
  showNewAdministratorForm: boolean;
}

export default class AdministratorsPage extends Component<
  {},
  AdministratorsPageState
> {
  constructor(props: {}) {
    super(props);

    this.state = {
      loading: true,
      waiting: false,
      error: undefined,
      administrators: [],
      confirm: closedDialog(),
      showNewAdministratorForm: false,
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined,
      });
    }

    get<Administrator[]>("/api/administrators").then(
      (administrators) => {
        this.setState({
          loading: false,
          administrators,
        });
      },
      (error: ApplicationError) => {
        error.retry = () => {
          this.load();
        };
        this.setState({
          loading: false,
          error,
        });
      }
    );
  }

  dismissDialog(): void {
    const dialog = this.state.confirm;
    dialog.open = false;
    this.setState({
      waiting: false,
      confirm: dialog,
    });
  }

  addErrorToDialog(error: ApplicationError): void {
    const dialog = this.state.confirm;
    dialog.error = error;
    this.setState({
      waiting: false,
      confirm: dialog,
    });
  }

  onRemoveClick(item: Administrator): void {
    this.setState({
      confirm: {
        open: true,
        title: `Remove administrator "${item.email}"?`,
        description:
          "If confirmed, this administrator won`t be able to login anymore. ",
        close: () => this.dismissDialog(),
        confirm: () => this.remove(item),
      },
    });
  }

  remove(item: Administrator): void {
    this.setState({
      waiting: true,
    });

    del(`/api/administrators/${item.id}`).then(
      () => {
        ArrayUtils.remove(this.state.administrators, item);
        this.dismissDialog();
      },
      (error: ApplicationError) => {
        this.addErrorToDialog(error);
      }
    );
  }

  onNewAdministrator(): void {
    this.load();
  }

  render(): ReactElement {
    const {administrators, confirm, error, loading, waiting} = this.state;

    return (
      <Layout title="Administrators">
        {waiting && <Loader className="overlay" />}
        <Panel error={error} load={this.load.bind(this)} loading={loading}>
          <h1>Administrators</h1>
          <AdministratorsTable
            items={administrators}
            onRemove={this.onRemoveClick.bind(this)}
          />
          <p>
            <strong>Note:</strong> all the administrators of the organization
            are automatically administrators of the CLA-Bot. Using this
            interface it is possible to configure administrators of the CLA-Bot
            without granting them admin access over the whole organization.
          </p>
          <div className="new-item-region region">
            <NewAdministratorForm
              onNewAdministrator={this.onNewAdministrator.bind(this)}
            />
          </div>
        </Panel>
        <ConfirmDialog {...confirm} />
      </Layout>
    );
  }
}
