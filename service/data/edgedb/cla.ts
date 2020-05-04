import { Cla, ClaRepository } from "../../domain/cla";
import { connect } from "./connect";
import { injectable } from "inversify";


// const CLAS: { [email: string]: Cla; } = {};
interface ClaItem {
  id: string
  email: string
  signed_at: Date
}


@injectable()
export class EdgeDBClaRepository implements ClaRepository {

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
      console.info(cla);
      return cla;
    }

    return null;
  }

  async saveCla(data: Cla): Promise<void> {
    // CLAS[data.email] = data;
  }
}
