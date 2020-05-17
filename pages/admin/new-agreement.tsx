import Grid from "@material-ui/core/Grid";
import Layout from "../../components/admin/layout";
import { Button, TextField } from "@material-ui/core";
import { ErrorProps } from "../../components/common/error";
import { Component, ReactElement } from "react";


interface NewAgreementFormState {
  error?: ErrorProps
  loading: boolean
}


export default class NewAgreement
extends Component<{}, NewAgreementFormState> {

  render(): ReactElement {
    const state = this.state;

    return (
    <Layout title="New agreement">
      <h1>Create new agreement</h1>
      <form noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="name"
              variant="outlined"
              required
              fullWidth
              id="name"
              label="Name"
              autoFocus
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
            />
          </Grid>
        </Grid>
        <div className="buttons-area">
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={() => console.log("here")}
          >
            Confirm
          </Button>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={() => console.log("here")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Layout>
    )
  }
}
