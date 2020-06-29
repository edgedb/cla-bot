import {Pool} from "edgedb";
import {getEnvSettingOrThrow} from "../../common/settings";

let pool: Pool | undefined;

export async function getPool(): Promise<Pool> {
  if (pool === undefined) {
    pool = await Pool.create({
      connectOptions: {
        user: getEnvSettingOrThrow("EDGEDB_USER"),
        host: getEnvSettingOrThrow("EDGEDB_HOST"),
        database: "cla",
      },
      minSize: 1,
    });
  }

  return pool;
}
