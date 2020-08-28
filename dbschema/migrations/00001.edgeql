CREATE MIGRATION m17efft6tcgqio6lxeebecva72z34qh5wdnpvr5fq5vxrueu3fxxza
    ONTO initial
{
  CREATE TYPE default::Administrator {
      CREATE REQUIRED SINGLE PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  CREATE TYPE default::Agreement {
      CREATE REQUIRED SINGLE PROPERTY creation_time -> std::datetime {
          SET default := std::datetime_current();
      };
      CREATE OPTIONAL SINGLE PROPERTY description -> std::str;
      CREATE REQUIRED SINGLE PROPERTY name -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED SINGLE PROPERTY update_time -> std::datetime {
          SET default := std::datetime_current();
      };
  };
  CREATE TYPE default::AgreementVersion {
      CREATE REQUIRED SINGLE PROPERTY creation_time -> std::datetime {
          SET default := std::datetime_current();
      };
      CREATE REQUIRED SINGLE PROPERTY current -> std::bool {
          SET default := false;
      };
      CREATE REQUIRED SINGLE PROPERTY draft -> std::bool {
          SET default := true;
      };
  };
  ALTER TYPE default::Agreement {
      CREATE OPTIONAL MULTI LINK versions -> default::AgreementVersion;
  };
  CREATE TYPE default::AgreementText {
      CREATE REQUIRED SINGLE PROPERTY creation_time -> std::datetime {
          SET default := std::datetime_current();
      };
      CREATE REQUIRED SINGLE PROPERTY culture -> std::str;
      CREATE REQUIRED SINGLE PROPERTY text -> std::str;
      CREATE REQUIRED SINGLE PROPERTY title -> std::str {
          SET default := '';
      };
      CREATE REQUIRED SINGLE PROPERTY update_time -> std::datetime {
          SET default := std::datetime_current();
      };
  };
  ALTER TYPE default::AgreementVersion {
      CREATE OPTIONAL MULTI LINK texts -> default::AgreementText;
  };
  CREATE TYPE default::CommentInfo {
      CREATE REQUIRED SINGLE PROPERTY pull_request_id -> std::int64 {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED SINGLE PROPERTY comment_id -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED SINGLE PROPERTY creation_time -> std::datetime {
          SET default := std::datetime_current();
      };
      CREATE INDEX ON (.pull_request_id);
  };
  CREATE TYPE default::ContributorLicenseAgreement {
      CREATE REQUIRED SINGLE LINK agreement_version -> default::AgreementVersion;
      CREATE REQUIRED SINGLE PROPERTY creation_time -> std::datetime {
          SET default := std::datetime_current();
      };
      CREATE REQUIRED SINGLE PROPERTY email -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE INDEX ON (.agreement_version);
  };
  CREATE TYPE default::Repository {
      CREATE REQUIRED SINGLE LINK agreement -> default::Agreement;
      CREATE REQUIRED SINGLE PROPERTY full_name -> std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
