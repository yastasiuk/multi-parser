export interface DBConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface DBService {
  openConnection: () => Promise<void>;
  insertOne: (collectionName: string, entity: object) => Promise<void>;
  insertMany: (collectionName: string, entities: Array<object>) => Promise<void>;
  closeConnection: () => void;
  find: (collectionName: string, query: object, limit: number, skip: number) => Promise<any[]>;
}
