import { async_retry } from "../../common/resiliency";
import { AwaitConnection } from "edgedb/dist/src/client";
import { connect } from "./connect";
import { injectable } from "inversify";


@injectable()
export class EdgeDBRepository {

  @async_retry()
  async run<T>(action: (connection: AwaitConnection) => Promise<T>): Promise<T> {
    const connection = await connect()
    try {
      return await action(connection);
    } finally {
      await connection.close();
    }
  }

}
