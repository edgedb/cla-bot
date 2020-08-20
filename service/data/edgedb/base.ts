import {getPool} from "./connect";
import {injectable} from "inversify";
import {ConstraintViolationError, Connection} from "edgedb";
import {ConflictError, SafeError} from "../../common/web";

@injectable()
export class EdgeDBRepository {
  async run<T>(action: (connection: Connection) => Promise<T>): Promise<T> {
    const pool = await getPool();
    const connection = await pool.acquire();
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

      if (error instanceof TypeError) {
        if (/invalid UUID/.test(error.message)) {
          throw new SafeError(error.message, 404, undefined, "InvalidRequest");
        }
      }

      throw error;
    } finally {
      await pool.release(connection);
    }
  }
}
