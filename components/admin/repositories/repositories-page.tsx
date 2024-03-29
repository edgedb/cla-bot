import ArrayUtils from "../../array";
import ConfirmDialog, {
  closedDialog,
  ConfirmDialogProps,
} from "../../common/confirm-dialog";
import Layout from "../layout";
import NewRepositoryForm from "./repository-new";
import Panel from "../../common/panel";
import Loader from "../../common/loader";
import {Component, ReactElement} from "react";
import {del, get} from "../../fetch";
import {RepositoriesTable} from "./repositories-table";
import {Repository} from "./contracts";
import {ApplicationError} from "../../errors";

interface RepositoriesState {
  error?: ApplicationError;
  loading: boolean;
  waiting: boolean;
  repositories: Repository[];
  confirm: ConfirmDialogProps;
}

export default class Repositories extends Component<{}, RepositoriesState> {
  constructor(props: {}) {
    super(props);

    this.state = {
      loading: true,
      waiting: false,
      error: undefined,
      repositories: [],
      confirm: closedDialog(),
    };
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined,
      });
    }

    get<Repository[]>("/api/repositories").then(
      (items) => {
        this.setState({
          loading: false,
          repositories: items,
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

  onRemoveClick(item: Repository): void {
    this.setState({
      confirm: {
        open: true,
        title: `Remove the binding for "${item.fullName}"?`,
        description:
          `If confirmed, this repository - agreement ` +
          `binding will be removed. Later it is possible to create a ` +
          `new binding for "${item.fullName}".`,
        close: () => this.dismissDialog(),
        confirm: () => this.remove(item),
      },
    });
  }

  remove(item: Repository): void {
    this.setState({
      waiting: true,
    });

    del(`/api/repositories/${item.id}`).then(
      () => {
        ArrayUtils.remove(this.state.repositories, item);
        this.dismissDialog();
      },
      (error: ApplicationError) => {
        this.addErrorToDialog(error);
      }
    );
  }

  onNewRepository(): void {
    this.load();
  }

  render(): ReactElement {
    const {confirm, error, loading, repositories, waiting} = this.state;

    return (
      <Layout title="Repositories">
        {waiting && <Loader className="overlay" />}
        <Panel error={error} load={this.load.bind(this)} loading={loading}>
          <h1>Configured repositories</h1>
          <RepositoriesTable
            items={repositories}
            onRemove={this.onRemoveClick.bind(this)}
          />
          <div className="new-item-region region">
            <NewRepositoryForm
              repositories={repositories}
              onNewRepository={this.onNewRepository.bind(this)}
            />
          </div>
        </Panel>
        <ConfirmDialog {...confirm} />
      </Layout>
    );
  }
}
