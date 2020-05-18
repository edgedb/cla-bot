import Grid from "@material-ui/core/Grid";
import Layout from "../../../components/admin/layout";
import Paper from "@material-ui/core/Paper";
import Link from "next/link";
import { Button } from "@material-ui/core";
import { ReactElement, Component } from "react";
import { ErrorProps } from "../../../components/common/error";


// TODO: fetch agreement details (make web request)
export interface AgreementDetailsState {
  error?: ErrorProps
  loading: boolean
}


export default class AgreementDetailsPage
extends Component<{}, AgreementDetailsState> {

  constructor(props: {}) {
    super(props)
  }

  render(): ReactElement {
    return (
      <Layout title="Agreement details">
        <Paper>
          <h1>Agreement details</h1>
        </Paper>
        <div>
          <h2>Versions</h2>
        </div>
        <Link href="/admin/agreements">
          <Button
            type="button"
            variant="contained"
            color="primary"
          >
            Back to list
          </Button>
        </Link>
      </Layout>
    )
  }
}
