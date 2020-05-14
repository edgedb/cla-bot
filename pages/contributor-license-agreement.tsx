import Head from "next/head";
import Props from "../components/props";
import { AgreementsHandler } from "../service/handlers/licenses";
import { Button, Container } from "@material-ui/core";
import { ClaCheckInput } from "../service/domain/cla";
import { Component, ReactElement } from "react";
import { container } from "../service/di";
import { TokensHandler } from "../service/handlers/tokens";
import { TYPES } from "../constants/types";
import { NextPageContext, } from "next";


interface AgreementPageProps {
  state: string,
  title: string,
  text: string
}


const tokensHandler = container
  .get<TokensHandler>(TYPES.TokensHandler);
const licensesHandler = container
  .get<AgreementsHandler>(TYPES.AgreementsHandler);


function readStateParameter(context: NextPageContext): string {
  const state = context.query.state;

  if (typeof state !== "string") {
    throw new Error("Expected a single state parameter")
  }

  return state;
}


export async function getServerSideProps(
  context: NextPageContext
): Promise<Props<AgreementPageProps>> {
  const rawState = readStateParameter(context)
  const state = tokensHandler.parseToken(rawState) as ClaCheckInput;

  // Read the current agreement for the PR repository
  const licenseText = await licensesHandler.getAgreementTextForRepository(
    state.repository.fullName,
    "en"
  )

  state.licenseVersionId = licenseText.versionId;

  // Modify the state parameter to include the version id:
  // this ensures that we store the right version id when the user signs in
  // to agree
  return {
    props: {
      state: tokensHandler.createToken(state),
      text: licenseText.text,
      title: licenseText.title
    }
  };
}


export default class AgreementPage extends Component<AgreementPageProps> {

  render(): ReactElement {
    const {
      state,
      text,
      title
    } = this.props
    const signInAnchorOps = { href: `/api/contributors/auth/github?state=${state}` }

    // TODO: use markdown, disable HTML tags for extra security

    // We are the owners of the text configured for licenses,
    // so dangerouslySetInnerHTML is not dangerous, unless an administrator
    // wants to sabotage the system (we have a bigger problem then).

    return (
      <Container className="contributor-agreement-area" maxWidth="md">
        <Head>
          <title>{title}</title>
          <link rel="icon" href="/favicon.png" type="image/x-icon" />
        </Head>

        <main>
          <div dangerouslySetInnerHTML={{ __html: text }}></div>
          <Button variant="contained" color="primary">
            <a {...signInAnchorOps}>Sign in with GitHub to agree</a>
          </Button>
        </main>
        <footer>
        </footer>
      </Container>
    )
  }
}
