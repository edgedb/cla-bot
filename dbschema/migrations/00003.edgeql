CREATE MIGRATION m1xz5pf3vdfhz2jg7irvfbvlu3lxnw4yrv2i4ycj3ygrkvgq3mcq6a
    ONTO m1oybewgybopqrrclvjd7yuk2c5wldtkrgh2s7bne72y63hq3joqxq
{
  ALTER TYPE default::ContributorLicenseAgreement {
      CREATE PROPERTY normalized_email := (std::str_lower(.email));
      CREATE CONSTRAINT std::exclusive ON (.normalized_email);
      CREATE INDEX ON (.normalized_email);
      CREATE INDEX ON (.email);
  };
};
