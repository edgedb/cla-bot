import { async_retry } from "../../common/resiliency";
import { Cla, ClaRepository } from "../../domain/cla";
import { connect } from "./connect";
import { injectable } from "inversify";


interface ClaItem {
  id: string
  email: string
  signed_at: Date
}


@injectable()
export class EdgeDBClaRepository implements ClaRepository {

  @async_retry()
  async getClaByEmailAddress(email: string): Promise<Cla | null> {
    let signed_cla: ClaItem[];
    const connection = await connect()
    try {
      signed_cla = await connection.fetchAll(
        "select CLA { email, signed_at } filter .email = <str>$0 limit 1;",
        [email]
      )
    } finally {
      await connection.close();
    }

    if (signed_cla) {
      const item = signed_cla[0];
      const cla = new Cla(item.id, item.email, item.signed_at);
      return cla;
    }

    return null;
  }

  @async_retry()
  async saveCla(data: Cla): Promise<void> {
    const connection = await connect()
    try {
      const result = await connection.fetchAll(
        `
        INSERT CLA {
          email := <str>$email,
          version := <str>$version,
          signed_at := <datetime>$signed_at
        }
        `,
        {
          email: data.email,
          version: "1",
          signed_at: data.signed_at
        }
      )
      data.id = result[0].id;
    } finally {
      await connection.close();
    }
  }
}
