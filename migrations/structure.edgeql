START TRANSACTION;

CREATE MIGRATION structure TO {
    module default {

        type CommentInfo {
            required property comment_id -> str {
                constraint exclusive;
            };
            required property pull_request_id -> int64 {
                constraint exclusive;
            };
            required property creation_time -> datetime {
                default := datetime_current();
            }

            index on (.pull_request_id);
        }

        type Admin {
            property name -> str;

            required property email -> str {
                constraint exclusive;
            }
        }

        type License {
            required property name -> str {
                constraint exclusive;
            }

            property description -> str;

            multi link versions -> LicenseVersion;
        }

        type LicenseVersion {
            required property number -> int32 {
                constraint exclusive;
            }

            required property current -> bool {
                default := False;
            }

            required property draft -> bool {
                default := True;
            }

            multi link texts -> LicenseText;

            required property creation_time -> datetime {
                default := datetime_current();
            }
        }

        type LicenseText {
            required property text -> str;

            required property title -> str {
                default := "";
            }

            required property culture -> str;
        }

        type Repository {
            required property full_name -> str {
                constraint exclusive;
            };

            required link license -> License;
        }

        type ContributorLicenseAgreement {
            required property email -> str {
                constraint exclusive;
            };

            required property creation_time -> datetime {
                default := datetime_current();
            }

            required link licenseVersion -> LicenseVersion;

            index on (.email);

            index on (.licenseVersion);
        }
    }
};

COMMIT MIGRATION structure;

COMMIT;
