import AgreementsPage from "../../components/admin/agreements/agreements-page";
import { ReactElement } from "react";
import { GetServerSideProps } from "next";
import { page_auth } from "../../pages-common/auth";


export const getServerSideProps: GetServerSideProps = async (context) => {
  await page_auth(context.req, context.res);
  return { props: {} };
}


export default function Page(): ReactElement {
  return <AgreementsPage />
}
