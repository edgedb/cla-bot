import {AwaitConnection} from "edgedb/dist/src/client";
import {connect} from "./connect";
import {injectable} from "inversify";
import {ConstraintViolationError} from "edgedb";
import {ConflictError, SafeError} from "../../common/web";

@injectable()
export class EdgeDBRepository {
  async run<T>(
    action: (connection: AwaitConnection) => Promise<T>
  ): Promise<T> {
    // TODO: use a connection pool, when it is implemented in edgedb-js
    const connection = await connect();
    try {
      return await action(connection);
    } catch (error) {
      // handles common errors in a centralized manner, rethrowing exceptions
      // that handled by the front-end and used to return information
      // to the client
      if (error instanceof ConstraintViolationError) {
        if (/violates exclusivity constraint/.test(error.message)) {
          throw new ConflictError(`${error}`);
        }

        throw new SafeError(`${error}`, 400, error, "InvalidRequest");
      }

      throw error;
    } finally {
      await connection.close();
    }
  }
}
