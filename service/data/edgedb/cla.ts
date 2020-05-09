import { Cla, ClaRepository } from "../../domain/cla";
import { EdgeDBRepository } from "./base";
import { injectable } from "inversify";


interface ClaItem {
  id: string
  email: string
  creation_time: Date
}


@injectable()
export class EdgeDBClaRepository extends EdgeDBRepository implements ClaRepository {

  async getClaByEmailAddress(email: string): Promise<Cla | null> {
    let signed_cla: ClaItem[] = await this.run(async (connection) => {
      return await connection.fetchAll(
        "select CLA { email, creation_time } filter .email = <str>$0 limit 1;",
        [email]
      );
    })

    if (signed_cla.length) {
      const item = signed_cla[0];
      return new Cla(item.id, item.email, item.creation_time);
    }

    return null;
  }

  async saveCla(data: Cla): Promise<void> {
    await this.run(async connection => {
      const result = await connection.fetchAll(
        `
        INSERT CLA {
          email := <str>$email,
          version := <str>$version,
          creation_time := <datetime>$creation_time
        }
        `,
        {
          email: data.email,
          version: "1",
          creation_time: data.signed_at
        }
      )
      data.id = result[0].id;
    });
  }
}
