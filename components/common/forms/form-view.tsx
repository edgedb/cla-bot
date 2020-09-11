import ErrorPanel from "../error";
import {Component, ReactElement} from "react";
import {Button} from "@material-ui/core";
import Loader from "../loader";
import {ApplicationError} from "../../errors";

interface FormViewProps {
  submit: () => Promise<void>;
  edit: () => void;
  cancel: () => void;
  editing: boolean;
  className?: string;
  readonly?: boolean;
}

interface FormViewState {
  error?: ApplicationError;
  loading: boolean;
  submitting: boolean;
}

/**
 * Generic component to handle views of editable objects.
 * This component handles error views, loaders, cancel buttons to revert
 * changes in a centralized way.
 */
export default class FormView extends Component<FormViewProps, FormViewState> {
  constructor(props: FormViewProps) {
    super(props);

    this.state = {
      error: undefined,
      loading: false,
      submitting: false,
    };
  }

  submit(): void {
    this.setState({
      error: undefined,
      submitting: true,
    });

    this.props
      .submit()
      .then(
        () => {
          this.setState({
            error: undefined,
            submitting: false,
          });
        },
        (error: ApplicationError) => {
          this.setState({
            error,
            submitting: false,
          });
        }
      )
      .catch((error: ApplicationError) => {
        this.setState({
          error,
          submitting: false,
        });
      });
  }

  handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>): boolean {
    if (e.ctrlKey) {
      if (e.which === 83) {
        // CTRL + S
        e.preventDefault();
        this.submit();

        return false;
      }
    }

    return true;
  }

  cancel(): void {
    this.props.cancel();
  }

  edit(): void {
    this.props.edit();
  }

  renderButtons(): ReactElement[] {
    const elements: ReactElement[] = [];
    if (this.props.editing) {
      elements.push(
        <Button key="submit-button" onClick={() => this.submit()}>
          Confirm
        </Button>
      );
      elements.push(
        <Button
          key="cancel-button"
          variant="outlined"
          color="primary"
          onClick={() => this.cancel()}
        >
          Done
        </Button>
      );
    } else {
      elements.push(
        <Button
          key="edit-button"
          variant="outlined"
          color="primary"
          onClick={() => this.edit()}
        >
          Edit
        </Button>
      );
    }
    return elements;
  }

  render(): ReactElement {
    const {error, submitting} = this.state;
    const {children, className, readonly} = this.props;

    return (
      <div
        onKeyDown={this.handleKeyDown.bind(this)}
        className={"edit-view" + (className ? ` ${className}` : "")}
      >
        {submitting && <Loader className="overlay" />}
        {children}
        {error && <ErrorPanel error={error} />}
        {!readonly && (
          <div className="buttons-area">{this.renderButtons()}</div>
        )}
      </div>
    );
  }
}
