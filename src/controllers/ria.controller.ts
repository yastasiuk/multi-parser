import { RiaService } from "../services/ria.service";
import { vehicleType, CarEntity } from '../types/ria';

export class RiaController {
  private totalCars = 0;
  private parsedCars = 0;
  private currentPage = 0;

  constructor(private riaService: RiaService) {}

  getCarsData = async (cars: Array<{ id: string; type: vehicleType; }>) => {
    await this.riaService.reloadPage();
    for (let i = 0; i < cars.length; i++) {
      if (i % 100 === 0) {
        console.log(`Parting car #${i}`);
      }
      const car = cars[i];
      try {
        const carData = await this.riaService.fetchCarById(car.id);
        await this.riaService.saveCar(carData);
      } catch (e) {
        console.error(`Wasn't able to get "${car.id}"`)
        console.error(e);
        console.error('==================================');
      }
    }
  }
  
  getUsedCars = async () => {
    await this.fetchCarsPage(this.currentPage);
    let failed = 0;
    while (this.totalCars > this.parsedCars) {
      if (this.currentPage % 100 === 0) {
        console.log('PAGE:', this.currentPage);
      }
      try {
        await this.fetchCarsPage(this.currentPage);
        this.currentPage++;
        failed = 0;
      } catch(e) {
        failed++;
        console.log(`Failed page: ${this.currentPage}; #${failed}`);
        await this.waitSeconds(60);
      }
    }
    return `(Parsed: ${this.parsedCars}; Total: ${this.totalCars})`;
  }

  private async waitSeconds(seconds: number) {
    return await new Promise(res => {
      setTimeout(() => {
        res();
      }, 1000 * seconds);
    })
  }

  private fetchCarsPage = (page: number) => {
    const type: vehicleType = 'used';
    return new Promise(res => {
      setTimeout(() => {
        res();
      }, this.getTimeoutTime());
    })
      .then(() => this.riaService.searchCars(page, type))
      .then(async res => {
        this.totalCars = res.data.result.search_result.count; 
        const carsIds = res.data.result.search_result.ids.map(id => ({ id, type }));
        await this.riaService.saveSearchCarsIds(carsIds);
        this.parsedCars += carsIds.length;
        return carsIds;
      })
      // .then(carsIds => {
      //     const cars: any[] = [];
      //     const failedCars: any[] = [];
      //     return Promise.all(carsIds.map(carBasic => {
      //       this.riaService.fetchCar(carBasic)
      //         .then(car => cars.push(car))
      //         .catch(err => failedCars.push(carBasic))
      //     }))
      //     .then(() => ({ cars, failedCars }));
      // })
      // .then(async ({ cars, failedCars }) => {
      //   await this.riaService.saveCars(cars);
      //   await this.riaService.saveFailedCars(failedCars);
      // });
  }

  private getTimeoutTime = () => {
    const ms = 1000;
    return Math.random() * 2 * ms;
  }
}