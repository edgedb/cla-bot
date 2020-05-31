import { Button, TextField } from "@material-ui/core";
import { Component, ReactElement } from "react";
import ErrorPanel, { ErrorProps } from "../../common/error"
import Preloader from "../../common/preloader";
import { changeHandler } from "../../forms"
import { post, ApplicationError } from "../../fetch";
import { Administrator } from "./contracts";


interface NewAdministratorFormProps {
  onNewAdministrator: () => void;
}


interface NewAdministratorFormState {
  error?: ErrorProps
  submitError?: ErrorProps
  loading: boolean
  submitting: boolean
  email: string
  emailError: boolean
  emailHelperText: string
}


export default class NewAdministratorForm
extends Component<NewAdministratorFormProps, NewAdministratorFormState> {

  constructor(props: NewAdministratorFormProps) {
    super(props)

    this.state = {
      error: undefined,
      submitError: undefined,
      loading: true,
      submitting: false,
      email: "",
      emailError: false,
      emailHelperText: ""
    }
  }

  validate(): boolean {
    let anyError = false;
    const {
      email
    } = this.state;

    if (!email || !email.trim()) {
      this.setState({
        emailError: true,
        emailHelperText: "Please insert a value"
      })
      anyError = true;
    }

    // TODO: validate the value

    return !anyError;
  }

  submit(): void {
    if (!this.validate()) {
      return;
    }

    this.setState({
      submitting: true,
      error: undefined
    });

    const {
      email
    } = this.state;

    // TODO: support adding more administrators using more emails separated
    // by comma or semi-colon
    post("/api/administrators", {
      email: email.trim()
    }).then(() => {
      this.setState({
        email: "",
        submitting: false
      });

      this.props.onNewAdministrator();
    }, (error: ApplicationError) => {

      if (error.status === 409) {
        this.setState({
          submitting: false,
          emailError: true,
          emailHelperText: "There is already an administrator with this email."
        });
        return;
      }

      this.setState({
        submitting: false,
        submitError: {}
      });
    });
  }

  render(): ReactElement {
    const state = this.state;

    return (
    <div>
      {state.submitting && <Preloader className="overlay" />}
      <h1>Add new administrator</h1>
      <TextField
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
        <Button
          key="submit-button"
          onClick={() => this.submit()}
        >
          Submit
        </Button>
      </div>
      {state.submitError && <ErrorPanel {...state.submitError} />}
    </div>
    )
  }
}
