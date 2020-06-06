import Head from "next/head";
import {Container} from "@material-ui/core";
import {Component, ReactElement} from "react";
import {container} from "../service/di";
import {AgreementsHandler} from "../service/handlers/agreements";
import {TYPES} from "../constants/types";
import {NextPageContext, GetStaticProps} from "next";
import Props from "../components/props";
import ClaView from "../components/common/cla-view";

interface SignedLicenseProps {
  title: string;
  text: string;
}

const licensesHandler = container.get<AgreementsHandler>(
  TYPES.AgreementsHandler
);

function readVersionParameter(context: NextPageContext): string {
  const version = context.query.version;

  if (typeof version !== "string") {
    throw new Error("Expected a version parameter");
  }

  return version;
}

export async function getServerSideProps(
  context: NextPageContext
): Promise<Props<SignedLicenseProps>> {
  const versionId = readVersionParameter(context);

  // We only support English on the front-end,
  // but data model supports localization
  const cultureCode = "en";

  const agreementText = await licensesHandler.getAgreementText(
    versionId,
    cultureCode
  );

  return {props: {text: agreementText.text, title: agreementText.title}};
}

export default class SignedContributorLicenseAgreementPage extends Component<
  SignedLicenseProps
> {
  render(): ReactElement {
    const {text, title} = this.props;

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
