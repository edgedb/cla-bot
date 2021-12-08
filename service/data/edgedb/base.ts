import {getClient} from "./connect";
import {injectable} from "inversify";
import {ConstraintViolationError, Client} from "edgedb";
import {ConflictError, SafeError} from "../../common/web";

@injectable()
export class EdgeDBRepository {
  async run<T>(action: (connection: Client) => Promise<T>): Promise<T> {
    const client = await getClient();
    try {
      return await action(client);
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
