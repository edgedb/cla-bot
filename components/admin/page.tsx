import React from "react";
import {Component, ReactElement} from "react";

interface AdminPageState {
  authenticated: boolean;
}

/**
 * Renders its children only if the sessionStorage contains an
 * access token. Redirects to admin login page otherwise.
 */
export default class AdminPage extends Component<unknown, AdminPageState> {
  constructor(props: unknown) {
    super(props);

    this.state = {
      authenticated: false,
    };
  }

  componentDidMount(): void {
    const accessToken = sessionStorage.getItem("ACCESS_TOKEN");

    if (!accessToken) {
      location.replace("/admin/login");
      return;
    }

    this.setState({
      authenticated: true,
    });
  }

  render(): ReactElement {
    const {authenticated} = this.state;

    if (!authenticated) {
      return <React.Fragment></React.Fragment>;
    }

    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
