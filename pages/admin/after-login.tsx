import React, { ReactElement } from "react";
import { Component } from "react";


export default class AfterLoginPage extends Component {

  readTokenFromQuery(): string | null {
    const search = location.search;

    if (!search) {
      return null;
    }

    const match = search.match(/^\?token=([^\&]+)/);

    if (!match) {
      return null;
    }

    return match[1];
  }

  componentDidMount(): void {
    const token = this.readTokenFromQuery();

    if (!token) {
      location.replace("/admin/login");
      return;
    }

    // NB: the access token is set in the sessionStorage,
    sessionStorage.setItem("ACCESS_TOKEN", token);

    setTimeout(() => {
      location.replace("/admin");
    }, 200);
  }

  render(): ReactElement {
    return (
      <React.Fragment></React.Fragment>
    )
  }
}
