export class Administrator {
  id: string;
  email: string;

  constructor(id: string, email: string) {
    this.id = id;
    this.email = email;
  }
}

export interface AdministratorsRepository {
  getAdministrators(): Promise<Administrator[]>;

  getAdministratorByEmail(email: string): Promise<Administrator | null>;

  addAdministrator(email: string): Promise<void>;

  removeAdministrator(id: string): Promise<void>;
}
