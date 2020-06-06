import Layout from "./layout";
import {ReactElement, Component} from "react";
import Link from "next/link";

export default class DashboardView extends Component {
  render(): ReactElement {
    return (
      <Layout title="Dashboard">
        <h1>Welcome to the CLA-Bot Admin UI.</h1>

        <section className="big-text">
          <h2>Getting started</h2>
          <ol>
            <li>
              <Link href="/admin/agreements/new">
                <a>Create an agreement object</a>
              </Link>
            </li>
            <li>Configure the text of the first version of the agreement</li>
            <li>Mark the agreement version as "Done"</li>
            <li>Assign the agreement to repositories</li>
            <li>Configure administrators</li>
            <li>Search signed CLAs</li>
          </ol>
        </section>
        <section>
          <h2>Favicon credits</h2>
          <div>
            Icon made by
            <a href="https://www.flaticon.com/authors/freepik" title="Freepik">
              {" "}
              Freepik
            </a>
            &nbsp;from{" "}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
            <br />
            <br />
            <img src="/favicon.png" />
          </div>
        </section>
      </Layout>
    );
  }
}
