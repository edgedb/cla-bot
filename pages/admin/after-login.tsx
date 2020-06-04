import Avatar from "@material-ui/core/Avatar";
import Head from "next/head";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import React, { ReactElement } from "react";
import { Button, Container, Grid } from "@material-ui/core";
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

    // TODO: add the token to the cookie, so it can be read in requests for
    // pages.
    document.cookie = `access_token=${token}; expires=Thu, 18 Dec 2013 12:00:00 UTC";
    sessionStorage.setItem("ACCESS_TOKEN", token);
    location.replace("/admin");
  }

  render(): ReactElement {
    return (
      <React.Fragment></React.Fragment>
    )
  }
}
