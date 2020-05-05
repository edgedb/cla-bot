START TRANSACTION;

CREATE MIGRATION structure TO {
    module default {
        type CLA {
            required property email -> str {
                constraint exclusive;
            };
            required property version -> str;
            required property signed_at -> datetime;
        }
        type CommentInfo {
            required property comment_id -> str {
                constraint exclusive;
            };
            required property pull_request_id -> int64 {
                constraint exclusive;
            };
            required property created_at -> datetime;
        }
    }
};

COMMIT MIGRATION structure;

COMMIT;
