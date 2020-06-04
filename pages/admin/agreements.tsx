import AgreementsPage from "../../components/admin/agreements/agreements-page";
import { ReactElement } from "react";
import AdminPage from "../../components/admin/page";


export default function Page(): ReactElement {
  return (
    <AdminPage>
      <AgreementsPage />
    </AdminPage>
  )
}
