import { MongoClient, Db } from 'mongodb';
import { DBService, DBConfig } from './db.service';

export class MongoService implements DBService {
  private db: Db;
  private client: MongoClient;

  constructor(private dbConfig: DBConfig) {
    this.dbConfig = dbConfig;
  }

  openConnection = async (): Promise<void> => {
    return new Promise((res, rej) => {
      const url = `mongodb://${this.dbConfig.host}:${this.dbConfig.port}`;
      console.log('url', url);
      MongoClient.connect(url, {
        auth: {
          user: this.dbConfig.username,
          password: this.dbConfig.password,
        },
      },
        (err, client: MongoClient) => {
          if (err) {
            return rej(err);
          }
          console.log("Connected successfully to server");
          this.client = client;
          this.db = client.db(this.dbConfig.database);
          res();
        }
      );
    })
  }

  insertMany = (collectionName: string, entities: Array<object>): Promise<void> => {
    if (!this.db) {
      throw new Error('Cannot "insertMany"; db is not connected!');
    }
    const collection = this.db.collection(collectionName);
    // Insert some documents
    return new Promise((res, rej) => {
      collection.insertMany(entities, (err, result) => {
        if (err) {
          return rej(err);
        }
        res();
      });
    });
  }

  insertOne = (collectionName: string, entity: object): Promise<void> => {
    if (!this.db) {
      throw new Error('Cannot "insertMany"; db is not connected!');
    }

    const collection = this.db.collection(collectionName);
    return new Promise((res, rej) => {
      collection.insertOne(entity, (err, result) => {
        if (err) {
          return rej(err);
        }
        res();
      });
    })
  }

  find = async (collectionName: string, query: object = {}, limit: number = 20, skip: number = 0, options?: object) => {
    const collection = this.db.collection(collectionName);
    if (limit === -1) {
      return await collection.find(query, options).skip(skip).toArray();  
    }
    return await collection.find(query, options).limit(limit).skip(skip).toArray();
  }

  closeConnection = () => {
    console.log('closeConnection');
    this.client.close();
  }
}