import Grid from "@material-ui/core/Grid";
import Layout from "../../components/admin/layout";
import Link from "next/link";
import { Button, TextField } from "@material-ui/core";
import { ChangeEvent, Component, ReactElement } from "react";
import ErrorPanel, { ErrorProps } from "../../components/common/error";
import Preloader from "../../components/common/preloader";


interface NewAgreementFormState {
  error?: ErrorProps
  loading: boolean,
  name: string,
  nameError: boolean,
  nameHelperText?: string,
  description: string,
  submitting: boolean
}


export default class NewAgreement
extends Component<{}, NewAgreementFormState> {

  constructor(props: {}) {
    super(props)

    this.state = {
      error: undefined,
      loading: false,
      name: "",
      nameError: false,
      nameHelperText: undefined,
      description: "",
      submitting: false
    }
  }

  submit(): void {

    const name = this.state.name;

    if (!name) {
      // error: missing name
      this.setState({
        nameError: true,
        nameHelperText: "Please insert a name"
      })
      return;
    }

    this.setState({
      error: undefined,
      nameError: false,
      nameHelperText: undefined,
      submitting: true
    })

    // TODO: POST to create a new agreement
    fetch("/api/agreements", {
      method: "post",
      body: JSON.stringify({
        name,
        description: this.state.description
      })
    }).then(response => {
      if (response.status === 201) {
        // everything's good
        response.json().then(data => {
          location.replace(`/admin/agreements/${data.id}`)
        })
      } else {

        if (response.status === 409) {
          // name already taken
          response.json().then(data => {
            this.setState({
              nameError: true,
              nameHelperText: "There is already an agreement with this name",
              submitting: false
            })
          });
        } else {
          this.setState({
            error: {},
            submitting: false
          })
        }
      }
    }).catch(error => {
      this.setState({
        error: {
          message: `${error}`
        },
        submitting: false
      })
    })
  }

  handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const target = event.target;
    const name = target.name;
    const update: {[key: string]: string} = {};
    update[name] = target.value;
    // @ts-ignore
    this.setState(update)
  }

  render(): ReactElement {
    const state = this.state;

    return (
    <Layout title="New agreement">
      {state.submitting && <Preloader className="overlay" />}
      <h1>Create new agreement</h1>
      <form noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              error={state.nameError}
              helperText={state.nameHelperText}
              name="name"
              variant="outlined"
              required
              fullWidth
              id="name"
              label="Name"
              autoFocus
              autoComplete="off"
              onChange={this.handleChange.bind(this)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              fullWidth
              name="description"
              label="Description"
              type="textarea"
              id="description"
              multiline
              rows={2}
              rowsMax={4}
              autoComplete="off"
              onChange={this.handleChange.bind(this)}
            />
          </Grid>
        </Grid>
        <div className="buttons-area">
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={() => this.submit()}
          >
            Confirm
          </Button>
          <Link href="/admin/agreements">
            <Button
              type="button"
              variant="contained"
              color="primary"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
      {state.error && <ErrorPanel {...state.error} />}
    </Layout>
    )
  }
}
