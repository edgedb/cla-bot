import edgedb from "edgedb";
import {AwaitConnection} from "edgedb/dist/src/client";
import {getEnvSettingOrThrow} from "../../common/settings";

export async function connect(): Promise<AwaitConnection> {
  return await edgedb({
    user: getEnvSettingOrThrow("EDGEDB_USER"),
    host: getEnvSettingOrThrow("EDGEDB_HOST"),
    password: getEnvSettingOrThrow("EDGEDB_PASSWORD"),
    database: "cla",
  });
}
