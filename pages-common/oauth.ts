import {NextApiRequest} from "next";

export function readOAuthError(req: NextApiRequest): string | null {
  const query = req.query;
  const error = query.error;
  const error_description = query.error_description;

  if (error) {
    return `OAuth integration error: ${error}; description: ${error_description}`;
  }
  return null;
}
