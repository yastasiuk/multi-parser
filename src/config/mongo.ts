
import { Config } from './config';


class MongoConfig extends Config {
  constructor(env: { [k: string]: string | undefined }) {
    super(env);
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public getMongoConfig() {
    return {
      host: this.getValue('DB_HOST'),
      port: parseInt(this.getValue('DB_PORT'), 10),
      username: this.getValue('DB_USER'),
      password: this.getValue('DB_PASSWORD'),
      database: this.getValue('DB_DATABASE'),
    };
  }
}


const conf = new MongoConfig(process.env)
  .ensureValues([
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_DATABASE',
  ]);

export const mongoConfig = conf.getMongoConfig();
