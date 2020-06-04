import AdminPage from "../../../components/admin/page";
import NewAgreementPage from "../../../components/admin/agreements/agreement-new";
import { ReactElement } from "react";


export default function Page(): ReactElement {
  return (
    <AdminPage>
      <NewAgreementPage />
    </AdminPage>
  );
}
