import AdministratorsPage
from "../../components/admin/administrators/administrators-page";
import { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { page_auth } from "../../pages-common/auth";


export const getServerSideProps: GetServerSideProps = async (context) => {
  await page_auth(context.req, context.res);
  return { props: {} };
}


export default function Page(): ReactElement {
  // TODO: read access token from the session storage, if missing, redirect
  // the user to the login page.
  return <AdministratorsPage />
}
