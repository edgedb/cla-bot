import {NextApiRequest, NextApiResponse} from "next";
import {ErrorDetails, SafeError} from "../../service/common/web";
import {container} from "../../service/di";
import {TYPES} from "../../constants/types";
import {ServiceSettings} from "../../service/settings";

const settings = container.get<ServiceSettings>(TYPES.ServiceSettings);

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

interface Metadata {
  organizationName: string;
  organizationDisplayName: string;
}

export default (req: NextApiRequest, res: NextApiResponse<Metadata>) => {
  res.status(200).json({
    organizationName: settings.organizationName,
    organizationDisplayName: settings.organizationDisplayName,
  });
};
