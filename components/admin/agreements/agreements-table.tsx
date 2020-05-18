import { Component, ReactElement } from "react";
import Link from "next/link";


export interface AgreementsTableItem {
  id: string
  name: string,
  description: string,
  creationTime: string
}


export interface AgreementsTableProps {
  items: AgreementsTableItem[]
}


export class AgreementsTable extends Component<AgreementsTableProps> {

  constructor(props: AgreementsTableProps) {
    super(props);
  }

  render(): ReactElement {
    const items = this.props.items;

    if (items.length === 0)
      return <p>There are no configured agreements.</p>

    return <table>
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Description</th>
          <th>Created at</th>
          <th></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
      {
      items.map((item, index) => {
        return <tr key={item.id}>
          <td>{index + 1}</td>
          <td>
            <Link
            href="/admin/agreements/[id]"
            as={"/admin/agreements/" + item.id}>
              <a>{item.name}</a>
            </Link>
          </td>
          <td className="description-cell">{item.description}</td>
          <td>{new Date(Date.parse(item.creationTime)).toLocaleString()}</td>
          <td>

          </td>
          <td></td>
        </tr>
      })
      }
      </tbody>
    </table>
  }
}
