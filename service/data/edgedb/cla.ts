import { Cla, ClaRepository } from "../../domain/cla";
import { injectable } from "inversify";


const CLAS: { [email: string]: Cla; } = {};


@injectable()
class EdgeDBClaRepository implements ClaRepository {

  async getClaByEmailAddress(email: string): Promise<Cla | null> {
    return CLAS[email] || null;
  }

  async saveCla(data: Cla): Promise<void> {
    CLAS[data.email] = data;
  }
}

export { EdgeDBClaRepository };
