import Layout from "../layout";
import { Component, ReactElement } from "react";
import { ClaSearch } from "./clas-search";


export default class ClaPage extends Component {

  render(): ReactElement {
    return (
      <Layout title="CLA">
        <h1>Contributor License Agreements</h1>
        <ClaSearch />
      </Layout>
    )
  }
}
