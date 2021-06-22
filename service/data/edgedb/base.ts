import {getPool} from "./connect";
import {injectable} from "inversify";
import {ConstraintViolationError} from "edgedb";
import {ConflictError, SafeError} from "../../common/web";
import { Executor } from "edgedb/dist/src/ifaces";

@injectable()
export class EdgeDBRepository {
  async run<T>(action: (connection: Executor) => Promise<T>): Promise<T> {
    const connection = await getPool();
    try {
      return connection.retryingTransaction(async tx => {
        return await action(tx);
      })
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
    }
  }
}
