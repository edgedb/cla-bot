import AdministratorsPage
from "../../components/admin/administrators/administrators-page";
import AdminPage from "../../components/admin/page";
import { ReactElement } from "react";


export default function Page(): ReactElement {
  return (
    <AdminPage>
      <AdministratorsPage />
    </AdminPage>
  )
}
