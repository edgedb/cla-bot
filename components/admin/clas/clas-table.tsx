import { ContributorLicenseAgreement } from "./contracts";
import { Component, ReactElement } from "react";
import formatDate from "../../format-date";


export interface ClasTableProps {
  items: ContributorLicenseAgreement[]
}


export class ClasTable extends Component<ClasTableProps> {

  render(): ReactElement {
    const items = this.props.items;

    if (items.length === 0)
      return <p>There are no signed CLAs.</p>

    return (
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Email</th>
            <th>Version ID</th>
            <th>Signed at</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
        {
        items.map((item, index) => {
          return (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.email}</td>
              <td>{item.versionId}</td>
              <td>{formatDate(item.signedAt)}</td>
            </tr>
          );
        })
        }
        </tbody>
      </table>
    );
  }
}
