import Grid from "@material-ui/core/Grid";
import Layout from "../layout"
import Link from "next/link";
import { Button, TextField } from "@material-ui/core";
import { Component, ReactElement } from "react";
import ErrorPanel, { ErrorProps } from "../../common/error"
import Preloader from "../../common/preloader";
import { changeHandler } from "../../forms"


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

    // TODO: create common code that handles headers and errors in a single
    // place
    fetch("/api/agreements", {
      method: "POST",
      body: JSON.stringify({
        name,
        description: this.state.description
      }),
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      }
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
            error: undefined,
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
          <Button onClick={() => this.submit()}>
            Confirm
          </Button>
          <Link href="/admin/agreements">
            <Button>
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
