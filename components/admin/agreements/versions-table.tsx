import formatDate from "../../format-date";
import Star from "@material-ui/icons/Star";
import StarBorder from "@material-ui/icons/StarBorder";
import DescriptionOutlined from "@material-ui/icons/DescriptionOutlined";
import { AgreementVersion } from "./contracts";
import { Component, ReactElement } from "react";
import Link from "next/link";


export interface VersionsTableProps {
  items: AgreementVersion[]
}


export class VersionsTable extends Component<VersionsTableProps> {

  constructor(props: VersionsTableProps) {
    super(props);
  }

  render(): ReactElement {
    const items = this.props.items;

    if (items.length === 0)
      return <p>There are no configured versions.</p>

    return <table>
      <thead>
        <tr>
          <th>Current</th>
          <th>Number</th>
          <th>Created at</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      {
      items.map((item) => {
        return <tr key={item.id}>
          <td className="current-version-icon-wrapper">
            {item.current ? <Star /> : <StarBorder />}
          </td>
          <td>
            {item.number}
          </td>
          <td>{formatDate(item.creationTime)}</td>
          <th>
            <div title="Edit texts">
              <Link href="/foo">
                <DescriptionOutlined />
              </Link>
            </div>
          </th>
        </tr>
      })
      }
      </tbody>
    </table>
  }
}
