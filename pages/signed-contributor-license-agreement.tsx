import Head from "next/head";
import {Container} from "@material-ui/core";
import {Component, ReactElement} from "react";
import ClaView from "../components/common/cla-view";
import ErrorPanel from "../components/common/error";
import {get} from "../components/fetch";
import Loader from "../components/common/loader";
import {ApplicationError} from "../components/errors";

interface SignedLicense {
  title: string;
  text: string;
}

interface SignedLicenseState {
  error?: ApplicationError;
  loading: boolean;
  data?: SignedLicense;
}

export default class SignedContributorLicenseAgreementPage extends Component<
  unknown,
  SignedLicenseState
> {
  constructor(props: unknown) {
    super(props);

    this.state = {
      loading: true,
    };
  }

  componentDidMount(): void {
    // Must happen on the client side
    this.load();
  }

  get query(): string {
    return location.search;
  }

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined,
      });
    }

    // Note: passes the query as is to the server
    get<SignedLicense>(`/api/signed-agreement${this.query}`).then(
      (data) => {
        this.setState({
          loading: false,
          data,
        });
      },
      (error: ApplicationError) => {
        error.retry = () => {
          this.load();
        };
        this.setState({
          loading: false,
          error,
        });
      }
    );
  }

  render(): ReactElement {
    const {loading, error, data} = this.state;

    if (loading) {
      return <Loader />;
    }

    if (error) {
      return <ErrorPanel error={error} />;
    }

    if (!data) {
      return (
        <ErrorPanel
          error={new ApplicationError("Agreement not found.", 404)}
        />
      );
    }

    const {title, text} = data;

    return (
      <Container className="contributor-agreement-area">
        <Head>
          <title>{title}</title>
        </Head>
        <main>
          <h1>{title}</h1>
          <ClaView body={text} />
        </main>
      </Container>
    );
  }
}
