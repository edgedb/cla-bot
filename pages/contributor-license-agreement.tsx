import Head from "next/head";
import { ClaCheckInput } from "../service/domain/cla";
import { Component } from "react";
import { container } from "../service/di";
import { TYPES } from "../constants/types";
import { NextPageContext, } from "next";
import { LicensesHandler } from "../service/handlers/licenses";
import { TokensHandler } from "../service/handlers/tokens";


interface LicenseProps {
  state: string,
  title: string,
  text: string
}


const tokensHandler = container.get<TokensHandler>(TYPES.TokensHandler);
const licensesHandler = container.get<LicensesHandler>(TYPES.LicensesHandler);


function readStateParameter(context: NextPageContext): string {
  const state = context.query.state;

  if (typeof state != "string") {
    throw new Error("Expected a single state parameter")
  }

  return state;
}


export async function getServerSideProps(context: NextPageContext) {
  const rawState = readStateParameter(context)
  const state = tokensHandler.parseToken(rawState) as ClaCheckInput;
  // Note: we support English only on the front-end, but data model supports localization
  const cultureCode = "en";

  if (!state.licenseVersionId)
    throw new Error("Missing license id in state");

  const licenseText = await licensesHandler.getLicenseText(
    state.licenseVersionId,
    cultureCode
  )

  return { props: { state: rawState, text: licenseText.text, title: licenseText.title } };
}


export default class LicensePage extends Component<LicenseProps> {

  render() {
    const { state, text, title } = this.props
    const signInAnchorOps = { href: `/api/contributors/auth/github?state=${state}` }

    // We are the owners of the text configured for licenses,
    // so dangerouslySetInnerHTML is not dangerous, unless an administrator
    // wants to sabotage the system (we have a bigger problem then).

    return (
      <div className="container">
        <Head>
          <title>{title}</title>
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
