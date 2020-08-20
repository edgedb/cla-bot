import {Button, TextField} from "@material-ui/core";
import {Component, ReactElement} from "react";
import ErrorPanel, {ErrorProps} from "../../common/error";
import Loader from "../../common/loader";
import {changeHandler} from "../../forms";
import {post, ApplicationError} from "../../fetch";
import {validateEmail} from "../../../service/common/emails";

interface NewAdministratorFormProps {
  onNewAdministrator: () => void;
}

interface NewAdministratorFormState {
  error?: ErrorProps;
  submitError?: ErrorProps;
  loading: boolean;
  submitting: boolean;
  email: string;
  emailError: boolean;
  emailHelperText: string;
}

export default class NewAdministratorForm extends Component<
  NewAdministratorFormProps,
  NewAdministratorFormState
> {
  constructor(props: NewAdministratorFormProps) {
    super(props);

    this.state = {
      error: undefined,
      submitError: undefined,
      loading: true,
      submitting: false,
      email: "",
      emailError: false,
      emailHelperText: "",
    };
  }

  validate(): boolean {
    let anyError = false;
    const {email} = this.state;

    if (!email || !email.trim()) {
      this.setState({
        emailError: true,
        emailHelperText: "Please insert a value",
      });
      anyError = true;
    }

    if (!validateEmail(email.trim())) {
      this.setState({
        emailError: true,
        emailHelperText:
          "The value is not a valid email address. " +
          "A single address is supported.",
      });
      anyError = true;
    }

    return !anyError;
  }

  submit(): void {
    if (!this.validate()) {
      return;
    }

    this.setState({
      submitting: true,
      error: undefined,
    });

    const {email} = this.state;

    post("/api/administrators", {
      email: email.trim(),
    }).then(
      () => {
        this.setState({
          email: "",
          submitting: false,
        });

        this.props.onNewAdministrator();
      },
      (error: ApplicationError) => {
        if (error.status === 409) {
          this.setState({
            submitting: false,
            emailError: true,
            emailHelperText:
              "There is already an administrator with this email.",
          });
          return;
        }

        this.setState({
          submitting: false,
          submitError: {},
        });
      }
    );
  }

  render(): ReactElement {
    const state = this.state;

    return (
      <div>
        {state.submitting && <Loader className="overlay" />}
        <h1>Add new administrator</h1>
        <TextField
          value={state.email}
          error={state.emailError}
          helperText={state.emailHelperText}
          name="email"
          required
          fullWidth
          label="Email"
          autoFocus
          autoComplete="off"
          onChange={changeHandler.bind(this)}
        />
        <div className="buttons-area">
          <Button key="submit-button" onClick={() => this.submit()}>
            Submit
          </Button>
        </div>
        {state.submitError && <ErrorPanel {...state.submitError} />}
      </div>
    );
  }
}
