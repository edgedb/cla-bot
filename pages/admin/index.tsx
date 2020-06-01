import Layout from "../../components/admin/layout";
import { ReactElement, Component } from "react";


export default class DashboardView extends Component {

  render(): ReactElement {
    return (
    <Layout title="Dashboard">
      <h1>Welcome to the CLA-Bot Admin UI.</h1>

      <section className="big-text">
        <h2>Getting started</h2>
        <ol>
          <li>Create an agreement object</li>
          <li>Configure the text of the first version of the agreement</li>
          <li>Mark the agreement version as "Done"</li>
          <li>Assign the agreement to repositories</li>
        </ol>
      </section>

      <div>Icons made by
        <a
          href="https://www.flaticon.com/authors/freepik"
          title="Freepik">Freepik
        </a>
        from <a href="https://www.flaticon.com/" title="Flaticon">
          www.flaticon.com
        </a>
      </div>
    </Layout>
    )
  }
}
