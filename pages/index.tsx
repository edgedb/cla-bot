import Head from "next/head";
import {Container} from "@material-ui/core";
import {Component, ReactElement} from "react";
import ErrorPanel, {ErrorProps} from "../components/common/error";
import {get} from "../components/fetch";
import Loader from "../components/common/loader";

interface ApiMetadata {
  organizationName: string;
  organizationDisplayName: string;
}

interface IndexState {
  error?: ErrorProps;
  loading: boolean;
  data?: ApiMetadata;
}

export default class Index extends Component<unknown, IndexState> {
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

  load(): void {
    if (this.state.error) {
      this.setState({
        loading: true,
        error: undefined,
      });
    }

    get<ApiMetadata>(`/api`).then(
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

    const {organizationDisplayName} = data;
    const title = `Contributor License Agreement (CLA) - ${organizationDisplayName} Open Source`;

    return (
      <Container>
        <Head>
          <title>{title}</title>
        </Head>
        <main>
          <div id="presentation">
            <h2>{organizationDisplayName}</h2>
            <div id="main-title-wrapper">
              <h1>Contributor License Agreement</h1>
              <a href="/admin/login">Administrator Sign in</a>
            </div>
            <section>
              <h2></h2>
              <p>
                We appreciate community contributions to code repositories open
                sourced by {organizationDisplayName}. By signing a contributor
                license agreement, we ensure that the community is free to use
                your contributions.
              </p>
            </section>
            <section>
              <h2>Signing the CLA</h2>
              <p>
                When you contribute to a {organizationDisplayName} open source
                project on GitHub with a new pull request, a bot will evaluate
                whether you have signed the CLA. If required, the bot will
                comment on the pull request, including a link to this system to
                accept the agreement.
              </p>
            </section>
          </div>
        </main>
      </Container>
    );
  }
}
