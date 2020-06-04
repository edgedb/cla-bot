import PreferencesPage from "../../components/admin/preferences-page";
import AdminPage from "../../components/admin/page";
import { ReactElement } from "react";


export default function Page(): ReactElement {
  return (
    <AdminPage>
      <PreferencesPage />
    </AdminPage>
  )
}
