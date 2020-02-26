import { config } from 'dotenv';
config({ path: '../../.env' });

export class Config {

  constructor(private env: { [k: string]: string | undefined }) { }

  public getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach(k => this.getValue(k, true));
    return this;
  }
}
