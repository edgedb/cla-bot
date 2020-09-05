import ImportClasPage from "../../components/admin/clas/import-page";
import {ReactElement} from "react";
import AdminPage from "../../components/admin/page";

export default function Page(): ReactElement {
  return (
    <AdminPage>
      <ImportClasPage />
    </AdminPage>
  );
}
