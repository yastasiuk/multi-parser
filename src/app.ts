import express from 'express';
import { RiaService } from "./services/ria.service";
import { RiaController } from "./controllers/ria.controller";
import { MongoService } from "./services/mongo.service";
import { mongoConfig } from './config/mongo';
import { riaConfig } from './config/ria';
import { serverConfig } from './config/server';
import { BrowserService } from "./services/browser.service";
import { MasterController } from "./controllers/master.controller";
import { SlaveController } from "./controllers/slave.controller";

const app = express();

class App {
  private mongoService: MongoService;
  private riaService: RiaService;
  private riaController: RiaController;
  private browserService: BrowserService;

  constructor() {
    this.browserService = new BrowserService();
    this.mongoService = new MongoService(mongoConfig);
    this.riaService = new RiaService(this.mongoService, this.browserService, riaConfig);
    this.riaController = new RiaController(this.riaService);

    this.init();
  }

  private init = async () => {
    await this.mongoService.openConnection();
    if (serverConfig.isMaster) {
      const masterController = new MasterController(this.mongoService);
      app.use('/', masterController.getRouter());
      app.listen(serverConfig.port, serverConfig.host, async () => {
        console.log(`Master is listening on "${serverConfig.host}:${serverConfig.port}"`);
      })
    } else {
      const slaveController = new SlaveController(this.riaController);
      app.use('/', slaveController.getRouter());
      app.listen(serverConfig.port, serverConfig.host, async () => {
        console.log(`Slave is working on "${serverConfig.host}:${serverConfig.port}". Master: ${serverConfig.masterHost}`);
        try {
          await slaveController.proceedTasks();
        } catch (e) {
          console.error(e);
          console.log(`Error with slave ${e.toString()}`);
        }
        console.log('Finished parsing data!');
        process.exit(0);
      });
    }
  }
}

new App();