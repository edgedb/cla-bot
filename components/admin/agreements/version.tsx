import ConfirmDialog, {
  ConfirmDialogProps,
  closedDialog,
} from "../../common/confirm-dialog";
import {AgreementVersion} from "./contracts";
import {Button} from "@material-ui/core";
import {Component, ReactElement} from "react";
import {post, ApplicationError} from "../../fetch";
import {VersionText} from "./version-text";
import Preloader from "../../common/preloader";

export interface VersionProps {
  details: AgreementVersion;
  onNewVersion: () => void;
  onCompleted: (version: AgreementVersion) => void;
  onMakeCurrent: (version: AgreementVersion) => void;
}

export interface VersionState {
  waiting: boolean;
  confirm: ConfirmDialogProps;
}

export class Version extends Component<VersionProps, VersionState> {
  constructor(props: VersionProps) {
    super(props);

    this.state = {
      waiting: false,
      confirm: closedDialog(),
    };
  }

  get URL(): string {
    return `/api/agreement-version/${this.props.details.id}`;
  }

  dismissDialog(): void {
    // avoid ugly effect when the text automatically disappers from the dialog
    const dialog = this.state.confirm;
    dialog.open = false;
    this.setState({
      waiting: false,
      confirm: dialog,
    });
  }

  addErrorToDialog(error: ApplicationError): void {
    const dialog = this.state.confirm;
    dialog.error = {}; // TODO: make a common function to display error
    this.setState({
      waiting: false,
      confirm: dialog,
    });
  }

  private execute(action: () => Promise<void>, callback: () => void): void {
    this.setState({
      waiting: true,
    });

    action().then(
      () => {
        this.dismissDialog();
        callback();
      },
      (error: ApplicationError) => {
        this.addErrorToDialog(error);
      }
    );
  }

  complete(): void {
    this.execute(
      async () => post(`${this.URL}/complete`),
      () => {
        this.props.onCompleted(this.props.details);
      }
    );
  }

  makeCurrent(): void {
    this.execute(
      async () => post(`${this.URL}/make-current`),
      () => {
        this.props.onMakeCurrent(this.props.details);
      }
    );
  }

  clone(): void {
    this.execute(
      async () => post(`${this.URL}/clone`),
      () => {
        this.props.onNewVersion();
      }
    );
  }

  onCompleteClick(): void {
    this.setState({
      confirm: {
        open: true,
        title: "Complete this version?",
        description:
          "Once you complete this version, its texts will be no more " +
          "editable. The version won`t be used automatically: " +
          "it must be set as current.",
        close: () => this.dismissDialog(),
        confirm: () => this.complete(),
      },
    });
  }

  onCloneClick(): void {
    this.setState({
      confirm: {
        open: true,
        title: "Clone this version?",
        description:
          "A new draft version of this agreement will be created, " +
          " with a copy of its texts.",
        close: () => this.dismissDialog(),
        confirm: () => this.clone(),
      },
    });
  }

  onMakeCurrentClick(): void {
    this.setState({
      confirm: {
        open: true,
        title: "Make this version current?",
        description:
          "When a version is set as current, its agreement text is " +
          "displayed for CLA checks on repositories associated with " +
          "this agreement.",
        close: () => this.dismissDialog(),
        confirm: () => this.makeCurrent(),
      },
    });
  }

  renderButtons(): ReactElement[] {
    const details = this.props.details;
    const elements: ReactElement[] = [];
    if (details.draft) {
      elements.push(
        <Button key="complete-button" onClick={() => this.onCompleteClick()}>
          Complete
        </Button>
      );
    } else if (!details.current) {
      elements.push(
        <Button
          key="complete-button"
          onClick={() => this.onMakeCurrentClick()}
        >
          Make current
        </Button>
      );
    }

    elements.push(
      <Button key="clone-button" onClick={() => this.onCloneClick()}>
        Clone
      </Button>
    );

    return elements;
  }

  render(): ReactElement {
    const state = this.state;
    const details = this.props.details;

    return (
      <div>
        {state.waiting && <Preloader className="overlay" />}
        <VersionText
          versionId={details.id}
          culture="en"
          draft={details.draft}
        />
        <div className="buttons-area">{this.renderButtons()}</div>
        <ConfirmDialog {...state.confirm} />
      </div>
    );
  }
}
