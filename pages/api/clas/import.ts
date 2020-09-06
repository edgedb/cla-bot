import {NextApiRequest, NextApiResponse} from "next";

interface AliveContract {
  alive: boolean;
  timestamp: Date;
}

interface ImportEntry {
  id: string;
  email: string;
  username: string;
}

interface ImportInput {
  agreementId: string;
  entries: ImportEntry[];
}

interface ImportEntryResult {
  success: boolean;
  entry: ImportEntry;
}

interface ImportOutput {
  results: ImportEntryResult[];
}

export default (req: NextApiRequest, res: NextApiResponse<AliveContract>) => {
  // TODO: import CLAs into the database;
  // TODO: verify that Agreement ID is valid;
  // TODO: use CONFLICT to handle existing agreements
  res.status(200).json({alive: true, timestamp: new Date()});
};
