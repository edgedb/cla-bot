// ATTENTION: the import of "reflect-metadata" must happen before inversify,
// otherwise inversify doesn't work - so don't sort imports here...
import "reflect-metadata";
import { Container } from "inversify";


const container = new Container();

export { container };
