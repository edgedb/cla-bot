import Head from "next/head";
import {Button, Container} from "@material-ui/core";
import {Component, ReactElement} from "react";
import ClaView from "../components/common/cla-view";
import ErrorPanel, {ErrorProps} from "../components/common/error";
import Loader from "../components/common/loader";
import {get} from "../components/fetch";

interface AgreementPageState {
  error?: ErrorProps;
  loading: boolean;
  data?: ContributorLicenseAgreement;
}

interface ContributorLicenseAgreement {
  state: string;
  title: string;
  text: string;
}

export default class AgreementPage extends Component<
  unknown,
  AgreementPageState
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
    get<ContributorLicenseAgreement>(`/api/cla${this.query}`).then(
      (data) => {
        this.setState({
          loading: false,
          data,
        });
      },
      () => {
        this.setState({
          loading: false,
          error: {
            retry: () => {
              this.load();
            },
          },
        });
      }
    );
  }

  render(): ReactElement {
    const {loading, error, data} = this.state;

    if (loading) {
      return <Loader />;
    }

    if (error || !data) {
      return <ErrorPanel {...error} />;
    }

    const {title, state, text} = data;
    const signInAnchorOps = {
      href: `/api/contributors/auth/github?state=${state}`,
    };

    return (
      <Container className="contributor-agreement-area">
        <Head>
          <title>{title}</title>
          <link rel="icon" href="/favicon.png" type="image/x-icon" />
        </Head>

        <main>
          <h1>{title}</h1>
          <ClaView body={text} />
          <Button variant="contained">
            <a {...signInAnchorOps}>Sign in with GitHub to agree</a>
          </Button>
        </main>
        <footer></footer>
      </Container>
    );
  }
}
