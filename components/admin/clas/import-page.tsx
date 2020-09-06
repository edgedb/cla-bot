import Layout from "../layout";
import {Component, ReactElement} from "react";
import {ClasImport} from "./clas-import";

export default class ClaPage extends Component {
  render(): ReactElement {
    return (
      <Layout title="Import Contributor License Agreements">
        <h1>Import Contributor License Agreements</h1>
        <ClasImport />
      </Layout>
    );
  }
}
