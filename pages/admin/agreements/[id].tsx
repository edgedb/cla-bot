import { ReactElement } from "react";
import { withRouter } from 'next/router'
import { WithRouterProps } from "next/dist/client/with-router";
import Preloader from "../../../components/common/preloader";
import AgreementDetailsPage from "../../../components/admin/agreements/agreement-page";


function Page({ router }: WithRouterProps): ReactElement {
  const agreementId = router.query.id

  if (typeof agreementId !== "string") {
    // For some reason, the router query parameters are only
    // populated when the code executes on the client.
    // This doesn't look logical, since the route parameter is in the URL,
    // which is of course parsed and used by the server side.
    // Since we don't care about SEO here, return a preloader if the route
    // is not available.
    return <Preloader className="overlay" />
  }

  return <AgreementDetailsPage id={agreementId} />
}

export default withRouter(Page)
