import ClasPage from "../../components/admin/clas/clas-page";
import { ReactElement } from "react";
import { page_auth } from "../../pages-common/auth";
import { GetServerSideProps } from "next";


export const getServerSideProps: GetServerSideProps = async (context) => {
  await page_auth(context.req, context.res);
  return { props: {} };
}


export default function Page(): ReactElement {
  return <ClasPage />
}
