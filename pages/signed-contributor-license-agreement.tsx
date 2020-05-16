import Head from "next/head";
import { Container } from "@material-ui/core";
import { Component, ReactElement } from "react";
import { container } from "../service/di";
import { AgreementsHandler } from "../service/handlers/licenses";
import { TYPES } from "../constants/types";
import { NextPageContext, GetStaticProps, } from "next";
import Props from "../components/props"


interface SignedLicenseProps {
  title: string,
  text: string
}


const licensesHandler = container
  .get<AgreementsHandler>(TYPES.AgreementsHandler);


function readVersionParameter(context: NextPageContext): string {
  const version = context.query.version;

  if (typeof version !== "string") {
    throw new Error("Expected a version parameter")
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

  const licenseText = await licensesHandler.getLicenseText(
    versionId,
    cultureCode
  )

  return { props: { text: licenseText.text, title: licenseText.title } };
}


export default class SignedContributorLicenseAgreementPage
extends Component<SignedLicenseProps> {

  render(): ReactElement {
    const { text, title } = this.props

    return (
      <Container className="contributor-agreement-area">
        <Head>
          <title>{title}</title>
        </Head>

        <main>
          <div dangerouslySetInnerHTML={{ __html: text }}></div>
        </main>
        <footer>
        </footer>
      </Container>
    )
  }
}
