
import { Config } from './config';


class ServerConfig extends Config {
  constructor(env: { [k: string]: string | undefined }) {
    super(env);
  }


  public getServerConfig() {
    return {
      host: this.getValue('HOST') || 'localhost',
      port: parseInt(this.getValue('PORT'), 10),
      isMaster: this.getValue('IS_MASTER') === 'true',
      masterHost: this.getValue('MASTER_HOST') || 'localhost:3000',
    };
  }
}


const conf = new ServerConfig(process.env)
  .ensureValues([
    'HOST',
    'PORT',
  ]);

export const serverConfig = conf.getServerConfig();
