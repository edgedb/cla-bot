import Layout from "../../components/admin/layout";
import { ReactElement, Component } from "react";


export default class DashboardView extends Component<{}> {

  constructor(props: {}) {
    super(props)
  }

  render(): ReactElement {
    return (
    <Layout title="Dashboard">
      <h1>Welcome to the CLA-Bot Admin UI.</h1>
      {/* TODO: link to user guide, for example */}
    </Layout>
    )
  }
}
