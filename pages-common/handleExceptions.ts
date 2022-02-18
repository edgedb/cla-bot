import {NextApiResponse} from "next";
import {ErrorDetails, SafeError} from "../service/common/web";

/**
 * Executes a given function, handling any thrown SafeError to serve
 * useful information to the client, in case of error.
 *
 * The error class is called "SafeError" because its purpose is to provide
 * error details to the client, unlike unhandled exceptions.
 */
export async function handleExceptions<T>(
  res: NextApiResponse<T | ErrorDetails>,
  action: () => Promise<void>
): Promise<void> {
  try {
    await action();
  } catch (error) {
    if (error instanceof SafeError) {
      // handled error: the service is behaving as desired
      res.status(error.statusCode).json(error.getObject());
      return;
    }

    throw error;
  }
}
