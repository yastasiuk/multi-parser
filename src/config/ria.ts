import { Config } from './config';

class RiaConfig extends Config {
  constructor(env: { [k: string]: string | undefined }) {
    super(env)
  }

  public getRiaConfig() {
    return {
      apiKey: this.getValue('RIA_APIKEY', true),
    };
  }

}


const conf = new RiaConfig(process.env)
  .ensureValues([
    'RIA_APIKEY',
  ]);

export const riaConfig = conf.getRiaConfig();
