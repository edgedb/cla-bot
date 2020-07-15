#!/usr/bin/env python3.7
# This file runs on Debian Buster and needs to be Python 3.7 compatible.

import os
import shutil
from typing import Dict

import boto3


def get_secrets_manager(region_name: str):
    session = boto3.session.Session()
    return session.client(service_name="secretsmanager", region_name=region_name)


def get_secret(secrets_manager, secret_name: str) -> str:
    # a prefix is used to enable multiple instances of the CLA-Bot inside the same
    # collection of secrets
    prefix = os.environ.get("SECRETS_PREFIX", "CLABOT_")
    data = secrets_manager.get_secret_value(SecretId=prefix + secret_name)
    return data.get("SecretString")


def write_pem_file(pem: str):
    with open("private-key.pem", mode="wt") as key_file:
        key_file.write(pem)


def get_env_variables(
    edgedb_host: str,
    github_application_id: str,
    oauth_application_id: str,
    oauth_application_secret: str,
    server_url: str,
    application_secret: str,
    organization_name: str,
) -> Dict[str, str]:
    """
    Returns a dictionary of all environmental variables handled by the web service.
    """
    return {
        "EDGEDB_HOST": edgedb_host or "127.0.0.1",
        "EDGEDB_USER": "edgedb",
        "GITHUB_RSA_PRIVATE_KEY": "private-key.pem",
        "GITHUB_APPLICATION_ID": github_application_id,
        "GITHUB_OAUTH_APPLICATION_ID": oauth_application_id,
        "GITHUB_OAUTH_APPLICATION_SECRET": oauth_application_secret,
        "SERVER_URL": server_url,
        "SECRET": application_secret,
        "ORGANIZATION_NAME": organization_name,
    }


def main() -> None:
    # Collect secrets and configure them as environmental variables read by the Next.js
    # application
    region = os.environ["REGION"]

    secrets_manager = get_secrets_manager(region)

    github_application_id = get_secret(secrets_manager, "GITHUB_APPLICATION_ID")

    oauth_application_id = get_secret(secrets_manager, "GITHUB_OAUTH_APPLICATION_ID")

    oauth_application_secret = get_secret(
        secrets_manager, "GITHUB_OAUTH_APPLICATION_SECRET"
    )

    private_rsa_key = get_secret(secrets_manager, "GITHUB_RSA_PRIVATE_KEY")

    application_secret = get_secret(secrets_manager, "SECRET")

    edgedb_host = get_secret(secrets_manager, "EDGEDB_HOST")

    server_url = get_secret(secrets_manager, "SERVER_URL")

    organization_name = get_secret(secrets_manager, "ORGANIZATION_NAME")

    # store the private RSA key on file system: the next.js app will read it
    write_pem_file(private_rsa_key)

    env_variables = get_env_variables(
        edgedb_host,
        github_application_id,
        oauth_application_id,
        oauth_application_secret,
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