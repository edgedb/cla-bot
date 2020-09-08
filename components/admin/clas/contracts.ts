// The interfaces below describe objects as they are received by the client
// (e.g. Dates are strings!).

// Objects defined in domain namespace are different as they represent
// higher level objects as they are handled by the server side.

export interface ContributorLicenseAgreement {
  id: string;
  email: string;
  username: string;
  versionId: string;
  signedAt: string;
}

export interface ImportEntry {
  id: string;
  email: string;
  username: string;
}

export interface ImportEntryResult {
  success: boolean;
  entry: ImportEntry;
  error?: string;
}

export interface ImportOutput {
  results: ImportEntryResult[];
}
