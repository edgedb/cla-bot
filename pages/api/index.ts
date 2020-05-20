
// TODO: make decorator, or put in a common place (like Express.js middleware)
import { NextApiResponse } from "next";
import { ErrorDetails, SafeError } from "../../service/common/web";


// having this function here is a temporary solution
export async function handleExceptions<T>(
  res: NextApiResponse<T | ErrorDetails>,
  action: () => Promise<void>
): Promise<void> {
  try {
    await action()
  } catch (error) {

    if (error instanceof SafeError) {
      // handled error: the service is behaving as desired
      res.status(error.statusCode).json(error.getObject());
      return;
    }

    throw error;
  }
}
