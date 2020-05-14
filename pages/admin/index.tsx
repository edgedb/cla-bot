import Grid from "@material-ui/core/Grid";
import Layout from "../../components/admin/layout";
import Paper from "@material-ui/core/Paper";


export default () => (
  <Layout>
    <Grid item xs={12} md={4} lg={3}>
      <Paper>
        <p>Hello</p>
      </Paper>
    </Grid>
    <Grid item xs={12}>
      <Paper>
      <p>World</p>
      </Paper>
    </Grid>
  </Layout>
)
