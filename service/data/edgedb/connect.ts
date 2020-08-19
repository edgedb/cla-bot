import {createPool, Pool} from "edgedb";
import {getEnvSettingOrThrow} from "../../common/settings";

let pool: Pool | undefined;

export async function getPool(): Promise<Pool> {
  if (pool === undefined) {
    pool = await createPool({
      connectOptions: {
        user: getEnvSettingOrThrow("EDGEDB_USER"),
        host: getEnvSettingOrThrow("EDGEDB_HOST"),
        password: getEnvSettingOrThrow("EDGEDB_PASSWORD"),
        database: "cla",
      },
      minSize: 1,
    });
  }

  return pool;
}
