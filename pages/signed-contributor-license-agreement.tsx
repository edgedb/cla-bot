import Head from "next/head";
import { Component } from "react";
import { container } from "../service/di";
import { LicensesHandler } from "../service/handlers/licenses";
import { TYPES } from "../constants/types";
import { NextPageContext, } from "next";


interface SignedLicenseProps {
  title: string,
  text: string
}


const licensesHandler = container.get<LicensesHandler>(TYPES.LicensesHandler);


function readVersionParameter(context: NextPageContext): string {
  const version = context.query.version;

  if (typeof version != "string") {
    throw new Error("Expected a version parameter")
  }

  return version;
}


export async function getServerSideProps(context: NextPageContext) {
  const versionId = readVersionParameter(context);

  // Note: we support English only on the front-end, but data model supports localization
  const cultureCode = "en";

  const licenseText = await licensesHandler.getLicenseText(
    versionId,
    cultureCode
  )

  return { props: { text: licenseText.text, title: licenseText.title } };
}


export default class SignedContributorLicenseAgreementPage extends Component<SignedLicenseProps> {

  render() {
    const { text, title } = this.props

    return (
      <div className="container">
        <Head>
          <title>{title}</title>
          <link rel="icon" href="/favicon.png" type="image/x-icon" />
        </Head>

        <main>
          <div dangerouslySetInnerHTML={{ __html: text }}></div>
        </main>
        <footer>
        </footer>
      </div>
    )
  }
}
