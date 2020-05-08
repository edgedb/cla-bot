START TRANSACTION;

CREATE MIGRATION licenses TO {
    module default {
        type Admin {
            property name -> str;

            multi link emails -> AdminEmail;
        }

        type AdminEmail {
            required property principal -> bool {
                default := False;
            }

            required property address -> str {
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
            required property serial -> int32;

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

            required property culture -> str;
        }

        type Repository {
            required property full_name -> str {
                constraint exclusive;
            };

            required link license -> License;
        }
    }
};

COMMIT MIGRATION licenses;

COMMIT;
