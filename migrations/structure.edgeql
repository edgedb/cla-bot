START TRANSACTION;

CREATE MIGRATION structure TO {
    module default {
        type CLA {
            required property email -> str {
                constraint exclusive;
            };

            index on (.email);

            required property version -> str;

            required property creation_time -> datetime {
                default := datetime_current();
            }
        }
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
    }
};

COMMIT MIGRATION structure;

COMMIT;
