import express, { Response, Router } from 'express';
import axios from 'axios';
import { RiaController } from './ria.controller';
import { serverConfig } from '../config/server'; // meh

export class SlaveController {
  private router: Router;
  constructor(private riaController: RiaController) {
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router = express.Router();
    this.router.get('/health', (_, res: Response) => {
      res.status(200).end();
    });
  }

  getRouter() {
    return this.router;
  }

  proceedTasks = async () => {
    let i = 0
    while (true) {
      const carIds = await this.getTasks();
      if (carIds.length === 0) {
        break
      }
      i++;
      console.log("Epoch", i);
      await this.riaController.getCarsData(carIds);
      await this.waitSeconds(60);
    }
  }

  private getTasks = async () => {
    return axios.get<Array<{ id: string; type: 'new' | 'used'; }>>(`${serverConfig.masterHost}/get-tasks`)
      .then(res => res.data)
  }


  private async waitSeconds(seconds: number) {
    return await new Promise(res => {
      setTimeout(() => {
        res();
      }, 1000 * seconds);
    })
  }
}