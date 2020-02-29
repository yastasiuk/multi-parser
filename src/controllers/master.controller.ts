import express, { Request, Response, Router } from 'express';
import { DBService } from "../services/db.service";

function arr_diff(a1: any[], a2: any[]) {
  var a = [], diff = [];

  for (var i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }

  for (var k in a) {
    diff.push(k);
  }

  return diff;
}


export class MasterController {
  private carsParsed = 0;
  private parseSession = 1000;
  private leftCarsIds: string[] = [];
  private router: Router;
  constructor(private dbService: DBService) {
    this.initializeRouter();
  }
  
  private initializeRouter = async () => {
    this.leftCarsIds = await this.getLeftCars();
    this.router = express.Router();
    this.router.get('/get-tasks', async (req: Request, res: Response) => {
      console.log(`Incoming connection for tasks.. Cars parsed: ${this.carsParsed}`);
      const carIds = await this.getPagesToParse();
      res.json(carIds);
    });

    this.router.get('/health', (_, res: Response) => {
      res.status(200).end();
    });
  }

  getRouter() {
    return this.router;
  }

  private getLeftCars = async () => {
    const allCars = await (await this.dbService.find('search-cars', {}, -1, 0)).map(v => v.id);
    const parsedCars = await (await this.dbService.find('car', {}, -1, 0, { "autoData.autoId": 1 })).map(v => v.autoData.autoId);
    return arr_diff(allCars, parsedCars);
  }

  private getPagesToParse = async () => {
    // it's async we don't want aka race conditions
    this.carsParsed += this.parseSession;
    return this.leftCarsIds.slice(this.carsParsed - this.parseSession, this.parseSession);
  }
}