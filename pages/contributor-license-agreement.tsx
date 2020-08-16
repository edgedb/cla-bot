import Head from "next/head";
import Props from "../components/props";
import {AgreementsHandler} from "../service/handlers/agreements";
import {Button, Container} from "@material-ui/core";
import {ClaCheckInput} from "../service/domain/cla";
import {Component, ReactElement} from "react";
import {container} from "../service/di";
import {TokensHandler} from "../service/handlers/tokens";
import {TYPES} from "../constants/types";
import {NextPageContext} from "next";
import ClaView from "../components/common/cla-view";
import {ServerError} from "../service/common/app";

interface AgreementPageProps {
  state: string;
  title: string;
  text: string;
}

const tokensHandler = container.get<TokensHandler>(TYPES.TokensHandler);
const licensesHandler = container.get<AgreementsHandler>(
  TYPES.AgreementsHandler
);

function readStateParameter(context: NextPageContext): string {
  const state = context.query.state;

  if (typeof state !== "string") {
    throw new Error("Expected a single state parameter");
  }

  return state;
}

export async function getServerSideProps(
  context: NextPageContext
): Promise<Props<AgreementPageProps>> {
  const rawState = readStateParameter(context);
  const state = tokensHandler.parseToken(rawState) as ClaCheckInput;

  // Read the current agreement for the PR repository
  // Note: the page always fetches the current agreement text, regardless
  // of thte time when the PR was created.
  const agreementText = await licensesHandler.getAgreementTextForRepository(
    state.repository.fullName,
    "en"
  );

  if (agreementText.versionId === null) {
    // We need the agreement version id here, for the reason described below
    throw new ServerError("Missing version id in agreement text context.");
  }

  state.agreementVersionId = agreementText.versionId;

  // Modify the state parameter to include the version id:
  // this ensures that we store the right version id when the user signs in
  // to agree
  return {
    props: {
      state: tokensHandler.createToken(state),
      text: agreementText.text,
      title: agreementText.title,
    },
  };
}

export default class AgreementPage extends Component<AgreementPageProps> {
  render(): ReactElement {
    const {state, text, title} = this.props;
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
