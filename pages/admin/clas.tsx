import ClasPage from "../../components/admin/clas/clas-page";
import {ReactElement} from "react";
import AdminPage from "../../components/admin/page";

export default function Page(): ReactElement {
  return (
    <AdminPage>
      <ClasPage />
    </AdminPage>
  );
}
