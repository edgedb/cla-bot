import Dashboard from "../../components/admin/dashboard";
import {ReactElement} from "react";
import AdminPage from "../../components/admin/page";

export default function Page(): ReactElement {
  return (
    <AdminPage>
      <Dashboard />
    </AdminPage>
  );
}
