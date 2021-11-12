import {EdgeDBRepository} from "./base";
import {injectable} from "inversify";
import {
  AdministratorsRepository,
  Administrator,
} from "../../domain/administrators";

@injectable()
export class EdgeDBAdministratorsRepository
  extends EdgeDBRepository
  implements AdministratorsRepository
{
  async getAdministrators(): Promise<Administrator[]> {
    const items = await this.run(async (connection) => {
      return await connection.query<{id: string; email: string}>(
        `SELECT Administrator {
          id,
          email
        };`
      );
    });

    return items.map((entity) => new Administrator(entity.id, entity.email));
  }

  async getAdministratorByEmail(email: string): Promise<Administrator | null> {
    const item = await this.run(async (connection) => {
      return await connection.querySingle<{id: string; email: string}>(
        `SELECT Administrator {
          id,
          email
        } FILTER .email = <str>$email;`,
        {
          email,
        }
      );
    });

    if (!item) {
      return null;
    }

    return new Administrator(item.id, item.email);
  }

  async addAdministrator(email: string): Promise<void> {
    await this.run(async (connection) => {
      await connection.query(
        `
        INSERT Administrator {
          email := <str>$email
        }
        `,
        {
          email,
        }
      );
    });
  }

  async removeAdministrator(id: string): Promise<void> {
    await this.run(async (connection) => {
      await connection.queryRequiredSingle(
        `
        DELETE Administrator FILTER .id = <uuid>$id
        `,
        {
          id,
        }
      );
    });
  }
}
