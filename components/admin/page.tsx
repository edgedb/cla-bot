import React from "react";
import {Component, ReactElement} from "react";
import {get} from "../fetch";
import ErrorPanel from "../common/error";
import Loader from "../common/loader";
import {ApplicationError} from "../errors";

interface AdminPageState {
  authenticated: boolean;
  error?: ApplicationError;
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

  redirectToLogin(): void {
    location.replace("/admin/login");
  }

  componentDidMount(): void {
    const accessToken = sessionStorage.getItem("ACCESS_TOKEN");

    if (!accessToken) {
      this.redirectToLogin();
      return;
    }

    // Make a web request to verify that the access token in the session
    // storage is valid. All API methods that modify data require an access
    // token and validate it, however it is best to not display the Admin UI
    // at all to users who simply modify their session storage to have any
    // value as "ACCESS_TOKEN" key.
    // If the token is expired, the user is redirected to the login page.

    // TODO: a possible improvement, is to support refresh tokens if the
    // user is still a valid administrator.

    get("/api/administrators/me").then(
      () => {
        this.setState({
          authenticated: true,
        });
      },
      (error: ApplicationError) => {
        sessionStorage.removeItem("ACCESS_TOKEN");

        if (error.status === 401) {
          this.redirectToLogin();
        } else {
          this.setState({
            error,
          });
        }
      }
    );
  }

  render(): ReactElement {
    const {authenticated, error} = this.state;

    if (!authenticated) {
      if (error !== undefined) {
        return <ErrorPanel error={error} />;
      }
      return <Loader className="overlay" />;
    }

    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}
