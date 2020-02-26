import axios from 'axios';
import { SearchResponse, vehicleType, CarEntity } from 'ria';
import { DBService } from './db.service';
import { BrowserService } from './browser.service';

export class RiaService {
  private readonly usedCarsAPI = 'https://developers.ria.com/auto';
  private readonly newCarsAPI = 'https://developers.ria.com/auto/new';

  private readonly autoRia = 'https://auto.ria.com';
  private readonly nonOfficialCarURL = 'https://auto.ria.com/demo/bu/searchPage/v2/view/auto';

  constructor(private dbService: DBService, private browserService: BrowserService, private config: { apiKey: string }) {}

  searchCars = async (page: number, type: 'new' | 'used' = 'used') => {
    const url = `${type === 'new' ? this.newCarsAPI : this.usedCarsAPI}/search`
    return axios.get<SearchResponse>(url, {
      params: {
        api_key: this.config.apiKey,
        category_id: 1,
        countpage: 100,
        page,
      }
    });
  }

  saveCars = async (cars: CarEntity[]) => {
    return this.dbService.insertMany('cars', cars);
  }

  saveCar = async (car: CarEntity) => {
    await this.dbService.insertOne('car', car);
  }

  saveSearchCarsIds = async (carsIds: Array<{ id: string; type: vehicleType; }>) => {
    return this.dbService.insertMany('search-cars', carsIds);
  }

  saveFailedCars = async (failedCars: { id: string; type: vehicleType }) => {
    throw new Error('[saveFailedCars] not Implemented');
  }

  private fetchAdditionalCarData = async (carLink: string): Promise<{ [key: string]: string[]; }> => {
    const url = `${this.autoRia}${carLink}`;
    if (!this.browserService.isActive()) {
      await this.browserService.startBrowser();
      await this.browserService.openPage(this.autoRia);
    }
    return this.browserService.executeScript(
      ({ url }: { url: string }) => window.fetch(url)
        .then(r => r.text())
        .then(html => new DOMParser().parseFromString(html, 'text/html').body)
        .then(body => [...body.querySelector('#description_v3').querySelectorAll('.show-line')].slice(1).reduce((acc, el) => {
          acc[el.querySelector('.label').textContent] = el.querySelector('.argument').textContent.split('•').map(t => t.trim().replace(/\s+/g, ' '))
          return acc;
        }, {} as { [key: string] : string[]})),
      { url: url.toString() },
    )
  }

  fetchCarById = async (carId: string) => {
    const url = `${this.nonOfficialCarURL}/${carId.slice(0, 4)}/${carId.slice(0, 6)}/${carId}?lang_id=2`;
    return axios.get<CarEntity>(url)
      .then(async res => {
        const viewLink = res.data.linkToView;
        const additionalData = await this.fetchAdditionalCarData(viewLink);
        return {
          ...res.data,
          autoData: {
            ...res.data.autoData,
            ...additionalData,
          }
        }
      });
  }
}

