CREATE MIGRATION m1oybewgybopqrrclvjd7yuk2c5wldtkrgh2s7bne72y63hq3joqxq
    ONTO m17efft6tcgqio6lxeebecva72z34qh5wdnpvr5fq5vxrueu3fxxza
{
  ALTER TYPE default::ContributorLicenseAgreement {
      CREATE SINGLE PROPERTY username -> std::str;
  };
};
