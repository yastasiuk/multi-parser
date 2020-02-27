import express, { Request, Response, Router } from 'express';
import { DBService } from "../services/db.service";

export class MasterController {
  private carsParsed = 11000;
  private parseSession = 1000;
  private router: Router;
  constructor(private dbService: DBService) {
    this.initializeRouter();
  }
  
  private initializeRouter () {
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

  private getPagesToParse = async () => {
    // it's async we don't want aka race conditions
    this.carsParsed += this.parseSession;
    return await this.dbService.find('search-cars', {}, this.parseSession, this.carsParsed - this.parseSession);
  }
}