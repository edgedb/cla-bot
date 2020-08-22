#!/usr/bin/env bash

######################################################################
# Configures app settings for an instance of CLA-Bot, as secrets.
# This script can also schedule for deletion and update secrets.
#
# Creating new secrets:
#   1. configure settings as in the example .env
#   2. configure the GitHub App private RSA key to the path
#      specified by GITHUB_RSA_PRIVATE_KEY
#   3. validate: ./clabot-secrets.sh
#   4. create secrets:
#        PUSH=1 ./clabot-secrets.sh
#
# Schedule previously configured secrets for deletion:
#        DELETE=1 ./clabot-secrets.sh
#
# Update previously configured secrets:
#        UPDATE=1 PUSH=1 ./clabot-secrets.sh
#
######################################################################

error () {
  lightred='\033[1;31m'
  nocolor='\033[0m'
  echo -e "${lightred}${1}${nocolor}" >&2
}

info () {
  lightcyan='\e[96m'
  nocolor='\033[0m'
  echo -e "${lightcyan}${1}${nocolor}" >&2
}

if [ -n "$REGION" ]; then
  echo "Using region: $REGION"
else
  REGION="us-east-2"
  info "Using default region: $REGION"
fi

if [ -n "$PREFIX" ]; then
  echo "Using secrets prefix: $PREFIX"
else
  PREFIX="CLABOT_"
  info "Using default secrets prefix: $PREFIX"
fi

echo

declare -a EXPECTED_SECRETS=(
  "EDGEDB_HOST"
  "EDGEDB_USER"
  "EDGEDB_PASSWORD"
  "GITHUB_APPLICATION_ID"
  "GITHUB_RSA_PRIVATE_KEY"
  "GITHUB_OAUTH_APPLICATION_ID"
  "GITHUB_OAUTH_APPLICATION_SECRET"
  "SERVER_URL"
  "SECRET"
  "ORGANIZATION_NAME"
)

if [ "$DELETE" == "1" ]; then
  info "Deleting secrets..."

  for EXPECTED_SECRET in "${EXPECTED_SECRETS[@]}"
  do
    info "Deleting $PREFIX$EXPECTED_SECRET"

    aws secretsmanager delete-secret \
      --region $REGION \
      --secret-id $PREFIX$EXPECTED_SECRET
  done

  exit 0
fi

if [ "$RESTORE" == "1" ]; then
  info "Restoring secrets..."

  for EXPECTED_SECRET in "${EXPECTED_SECRETS[@]}"
  do
    info "Restoring $PREFIX$EXPECTED_SECRET"

    aws secretsmanager restore-secret \
      --region $REGION \
      --secret-id $PREFIX$EXPECTED_SECRET
  done

  exit 0
fi

# Creating or updating secrets...

if ! [ "$PUSH" == "1" ]; then
  info "Validating without pushing. Use PUSH=1 to push secrets."
fi

if [ -e .env ]; then
  # read key value pairs from a configuration file
  info 'Reading env variables from ".env" file'
  set -a
  . .env
  set +a
else
  echo 'Missing ".env" file: variables can be defined in this file'
fi

HAS_ERRORS=0

for EXPECTED_SECRET in "${EXPECTED_SECRETS[@]}"
do
  if [ "$EXPECTED_SECRET" == "GITHUB_RSA_PRIVATE_KEY" ]; then
    # Special case: the private RSA key is red from a given file for
    FILE_PATH="${!EXPECTED_SECRET}"

    # Make sure that the file exists:
    if [ -e $FILE_PATH ]; then
      VALUE=$(<$FILE_PATH)
    else
      error "File not found: $FILE_PATH ✗"
      HAS_ERRORS=1
    fi
  else
    VALUE="${!EXPECTED_SECRET}"
  fi

  if [ -n "$VALUE" ]; then
    if [ "$PUSH" == "1" ]; then
      if [ "$UPDATE" == "1" ]; then
        echo "Updating $EXPECTED_SECRET..."

        aws secretsmanager update-secret \
          --region $REGION \
          --secret-id $PREFIX$EXPECTED_SECRET \
          --secret-string "$VALUE"
      else
        echo "Creating $EXPECTED_SECRET..."

        aws secretsmanager create-secret \
          --region $REGION \
          --name $PREFIX$EXPECTED_SECRET \
          --description "CLA-Bot $EXPECTED_SECRET" \
          --secret-string "$VALUE"
      fi
    else
      echo "$EXPECTED_SECRET ✓"
    fi
  else
    error "Missing env variable '$EXPECTED_SECRET' ✗"

    HAS_ERRORS=1
  fi
done

if [ $HAS_ERRORS == "1" ]; then
  error "Exiting... there are errors"
  exit 2
fi
