#!/usr/bin/env python3.7
# This file runs on Debian Buster and needs to be Python 3.7 compatible.

import os
import shutil
from typing import Dict

import boto3


def get_secrets_manager(region_name: str):
    session = boto3.session.Session()
    return session.client(service_name="secretsmanager", region_name=region_name)


def get_secret(secrets_manager, customer: str, secret_name: str) -> str:
    return secrets_manager.get_secret_value(
        SecretId=f"clabot/{customer}/{secret_name}"
    )


def write_pem_file(pem: str):
    with open("private-key.pem", mode="wt") as key_file:
        key_file.write(pem)


def get_env_variables(
    github_application_id: str,
    oauth_application_id: str,
    oauth_application_secret: str,
    edgedb_password: str,
    server_url: str,
    application_secret: str,
    organization_name: str,
) -> Dict[str, str]:
    return {
        "EDGEDB_HOST": "127.0.0.1",
        "EDGEDB_USER": "edgedb",
        "EDGEDB_PASSWORD": edgedb_password,
        "GITHUB_RSA_PRIVATE_KEY": "private-key.pem",
        "GITHUB_APPLICATION_ID": github_application_id,
        "GITHUB_OAUTH_APPLICATION_ID": oauth_application_id,
        "GITHUB_OAUTH_APPLICATION_SECRET": oauth_application_secret,
        "SERVER_URL": server_url,
        "SECRET": application_secret,
        "ORGANIZATION_NAME": organization_name
    }


def main() -> None:
    # Need to fetch secrets and configure them in .env file
    region = os.environ["REGION"]
    customer = os.environ["CUSTOMER"]
    server_url = os.environ["SERVER_URL"]
    organization_name = os.environ["ORGANIZATION_NAME"]

    secrets_manager = get_secrets_manager(region)

    github_application_id = get_secret(
        secrets_manager, customer, "GITHUB_APPLICATION_ID"
    )

    oauth_application_id = get_secret(
        secrets_manager, customer, "GITHUB_OAUTH_APPLICATION_ID"
    )

    oauth_application_secret = get_secret(
        secrets_manager, customer, "GITHUB_OAUTH_APPLICATION_SECRET"
    )

    private_rsa_key = get_secret(secrets_manager, customer, "GITHUB_RSA_PRIVATE_KEY")

    edgedb_password = get_secret(secrets_manager, customer, "EDGEDB_PASSWORD")

    edgedb_password = get_secret(secrets_manager, customer, "EDGEDB_PASSWORD")

    application_secret = get_secret(secrets_manager, customer, "SECRET")

    # store the private RSA key on file system: the next.js app will read it
    write_pem_file(private_rsa_key)

    env_variables = get_env_variables(
        github_application_id,
        oauth_application_id,
        oauth_application_secret,
        edgedb_password,
        server_url,
        application_secret,
        organization_name,
    )

    for key, value in env_variables.items():
        os.environ[key] = value

    # start the next application
    yarn_executable = shutil.which("yarn")

    if not yarn_executable:
        raise RuntimeError("Missing yarn executable")

    os.execv(yarn_executable, ("yarn", "next", "start", "-p", "80"))


if __name__ == "__main__":
    main()
