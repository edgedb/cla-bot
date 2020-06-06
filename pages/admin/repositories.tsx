import AdminPage from "../../components/admin/page";
import RepositoriesPage from "../../components/admin/repositories/repositories-page";
import {ReactElement} from "react";

export default function Page(): ReactElement {
  return (
    <AdminPage>
      <RepositoriesPage />
    </AdminPage>
  );
}
