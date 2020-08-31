#!/usr/bin/env python3.7
# This file runs on Debian Buster and needs to be Python 3.7 compatible.

from __future__ import annotations
from typing import Dict, Union, Any

import os
import shutil
import subprocess
import sys

import boto3


def get_secrets_manager(region_name: str):
    session = boto3.session.Session()
    return session.client(service_name="secretsmanager", region_name=region_name)


def get_secret(secrets_manager, secret_name: str) -> str:
    # a prefix is used to enable multiple instances of the CLA-Bot inside the same
    # collection of secrets
    if os.environ.get("CUSTOMER") and os.environ.get("INSTANCE"):
        prefix = (
            f'edbcloud/app/{os.environ["CUSTOMER"]}'
            f'/{os.environ["INSTANCE"]}/'
        )
    else:
        prefix = os.environ.get("SECRETS_PREFIX", "CLABOT_")
    data = secrets_manager.get_secret_value(SecretId=prefix + secret_name)
    return data.get("SecretString")


def write_pem_file(pem: str):
    with open("private-key.pem", mode="wt") as key_file:
        key_file.write(pem)


def get_env_variables(
    edgedb_host: str,
    edgedb_password: str,
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
        "EDGEDB_PASSWORD": edgedb_password,
        "GITHUB_RSA_PRIVATE_KEY": "private-key.pem",
        "GITHUB_APPLICATION_ID": github_application_id,
        "GITHUB_OAUTH_APPLICATION_ID": oauth_application_id,
        "GITHUB_OAUTH_APPLICATION_SECRET": oauth_application_secret,
        "SERVER_URL": server_url,
        "SECRET": application_secret,
        "ORGANIZATION_NAME": organization_name,
    }


def edgedb(
    *args: Union[str, bytes, os.PathLike],
    settings: Dict[str, str],
    check: bool = True,
    **kwargs: Any,
) -> subprocess.CompletedProcess:

    edgedb_cli = shutil.which("edgedb")
    if not edgedb_cli:
        raise RuntimeError('missing edgedb-cli executable')

    try:
        return subprocess.run(
            [
                edgedb_cli,
                '--user', settings['EDGEDB_USER'],
                '--host', settings['EDGEDB_HOST'],
                '--password-from-stdin',
                *args,
            ],
            input=settings['EDGEDB_PASSWORD'],
            text=True,
            check=check,
            **kwargs,
        )
    except subprocess.CalledProcessError as e:
        print(f'edgedb failed with exit code {e.returncode}', file=sys.stderr)
        print(e.stderr, file=sys.stderr)
        sys.exit(1)


def edgedb_output(
    *args: Union[str, bytes, os.PathLike],
    settings: Dict[str, str],
    **kwargs: Any,
) -> str:
    try:
        return edgedb(
            *args,
            settings=settings,
            capture_output=True,
            **kwargs,
        ).stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f'edgedb failed with exit code {e.returncode}', file=sys.stderr)
        if e.stderr:
            print(e.stderr, file=sys.stderr)
        sys.exit(1)


def main() -> None:
    # Collect secrets and configure them as environmental variables read by the Next.js
    # application
    region = os.environ["REGION"]

    secrets_manager = get_secrets_manager(region)

    private_rsa_key = get_secret(secrets_manager, "GITHUB_RSA_PRIVATE_KEY")

    # store the private RSA key on file system: the next.js app will read it
    write_pem_file(private_rsa_key)

    env_variables = get_env_variables(
        get_secret(secrets_manager, "EDGEDB_HOST"),
        get_secret(secrets_manager, "EDGEDB_PASSWORD"),
        get_secret(secrets_manager, "GITHUB_APPLICATION_ID"),
        get_secret(secrets_manager, "GITHUB_OAUTH_APPLICATION_ID"),
        get_secret(secrets_manager, "GITHUB_OAUTH_APPLICATION_SECRET"),
        get_secret(secrets_manager, "SERVER_URL"),
        get_secret(secrets_manager, "SECRET"),
        get_secret(secrets_manager, "ORGANIZATION_NAME"),
    )

    for key, value in env_variables.items():
        os.environ[key] = value

    # Create the "cla" database if not exists
    # TODO: replace this with `create-database --if-not-exists`
    # once supported.
    databases = set(edgedb_output(
        'list-databases',
        settings=env_variables,
    ).split('\n'))

    if 'cla' not in databases:
        edgedb('create-database', 'cla', settings=env_variables, check=True)

    # Apply migrations
    edgedb('-d', 'cla', 'migrate', settings=env_variables)

    # start the next application
    yarn_executable = shutil.which("yarn")

    if not yarn_executable:
        raise RuntimeError("Missing yarn executable")

    os.execv(yarn_executable, ("yarn", "next", "start", "-p", "80"))


if __name__ == "__main__":
    main()
