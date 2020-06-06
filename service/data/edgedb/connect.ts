import edgedb from "edgedb";
import {AwaitConnection} from "edgedb/dist/src/client";
import {getEnvSettingOrThrow} from "../../common/settings";

// TODO: how to inject as request scope service?
// https://github.com/inversify/InversifyJS/blob/master/wiki/scope.md

export async function connect(): Promise<AwaitConnection> {
  return await edgedb({
    user: getEnvSettingOrThrow("EDGEDB_USER"),
    host: getEnvSettingOrThrow("EDGEDB_HOST"),
    database: "cla",
  });
}
