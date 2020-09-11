import Grid from "@material-ui/core/Grid";
import Layout from "../layout";
import Link from "next/link";
import {Button, TextField} from "@material-ui/core";
import {Component, ReactElement} from "react";
import ErrorPanel from "../../common/error";
import Loader from "../../common/loader";
import {changeHandler} from "../../forms";
import {post} from "../../fetch";
import {ApplicationError} from "../../errors";

interface NewAgreementPageState {
  error?: ApplicationError;
  loading: boolean;
  name: string;
  nameError: boolean;
  nameHelperText?: string;
  description: string;
  submitting: boolean;
}

interface NewAgreementResponse {
  id: string;
}

export default class NewAgreementPage extends Component<
  {},
  NewAgreementPageState
> {
  constructor(props: {}) {
    super(props);

    this.state = {
      error: undefined,
      loading: false,
      name: "",
      nameError: false,
      nameHelperText: undefined,
      description: "",
      submitting: false,
    };
  }

  submit(): void {
    const name = this.state.name;

    if (!name) {
      // error: missing name
      this.setState({
        nameError: true,
        nameHelperText: "Please insert a name",
      });
      return;
    }

    this.setState({
      error: undefined,
      nameError: false,
      nameHelperText: undefined,
      submitting: true,
    });

    post<NewAgreementResponse>("/api/agreements", {
      name,
      description: this.state.description,
    }).then(
      (data: NewAgreementResponse) => {
        location.replace(`/admin/agreements/${data.id}`);
      },
      (error: ApplicationError) => {
        if (error.status === 409) {
          // name already taken
          this.setState({
            nameError: true,
            nameHelperText: "There is already an agreement with this name",
            submitting: false,
          });
        } else {
          this.setState({
            error,
            submitting: false,
          });
        }
      }
    );
  }

  render(): ReactElement {
    const {nameError, nameHelperText, error, submitting} = this.state;

    return (
      <Layout title="New agreement">
        {submitting && <Loader className="overlay" />}
        <h1>Create new agreement</h1>
        <form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                error={nameError}
                helperText={nameHelperText}
                name="name"
                required
                fullWidth
                label="Name"
                autoFocus
                autoComplete="off"
                onChange={changeHandler.bind(this)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                fullWidth
                name="description"
                label="Description"
                type="textarea"
                multiline
                rows={2}
                rowsMax={4}
                autoComplete="off"
                onChange={changeHandler.bind(this)}
              />
            </Grid>
          </Grid>
          <div className="buttons-area">
            <Button onClick={() => this.submit()}>Confirm</Button>
            <Link href="/admin/agreements">
              <Button>Cancel</Button>
            </Link>
          </div>
        </form>
        {error && <ErrorPanel error={error} />}
      </Layout>
    );
  }
}
