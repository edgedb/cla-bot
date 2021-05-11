import {createPool, Pool} from "edgedb";
import {getEnvSettingOrDefault} from "../../common/settings";

let pool: Pool | undefined;

export async function getPool(): Promise<Pool> {
  if (pool === undefined) {
    pool = await createPool({
      connectOptions: {
        database: getEnvSettingOrDefault("EDGEDB_DATABASE", "edgedb"),
      },
      minSize: 1,
    });
  }

  return pool;
}
