import Head from "next/head";
import { Component } from "react";
import { NextPageContext, } from "next";


interface Props {
  state: string
  text: string
}


export default class LicensePage extends Component<Props> {

  static async getInitialProps({ query }: NextPageContext) {
    // This page requires a valid state, to be passed over to OAuth flow and
    // handled back by our service, to know the source PR and PR author id
    const state = query.state;
    const cultureCode = query.culture || "en";

    // TODO: parse state, get full repo name, and fetch license by full repo name and culture code
    const text = `<p style="color: pink;">Example</p>`;

    return { state, text };
  }

  // async getServerSideProps(context: NextPageContext): Promise<any> {
  //   return {
  //     props: {
  //       text: "Example"
  //     }, // will be passed to the page component as props
  //   }
  // }

  render() {
    const { state, text } = this.props
    const signInAnchorOps = { href: `/api/contributors/auth/github?state=${state}` }

    // We are the owners of the text configured for licenses,
    // so dangerouslySetInnerHTML is not dangerous, unless an administrator
    // wants to sabotage the system (we have a bigger problem then).

    return (
      <div className="container">
        <Head>
          <title>CLA for EdgeDB</title>
          <link rel="icon" href="/favicon.png" type="image/x-icon" />
        </Head>

        <main>
          <div dangerouslySetInnerHTML={{ __html: text }}></div>
          <div>
            <a {...signInAnchorOps}>Sign in with GitHub to agree</a>
          </div>
        </main>
        <footer>
        </footer>
      </div>
    )
  }
}
