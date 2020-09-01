import Head from "next/head";
import {Container} from "@material-ui/core";
import {Component, ReactElement} from "react";
import ClaView from "../components/common/cla-view";
import ErrorPanel, {ErrorProps} from "../components/common/error";
import {get} from "../components/fetch";
import Loader from "../components/common/loader";

interface SignedLicense {
  title: string;
  text: string;
}

interface SignedLicenseState {
  error?: ErrorProps;
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
