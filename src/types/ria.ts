export type vehicleType = 'used' | 'new';

export interface SearchResponse {
  additional_params: object,
  result: {
    search_result: {
      ids: Array<string>;
      count: number;
      last_ids: number;
    };
    search_result_common: {
      data: Array<{ id: string; type: 'UsedAuto' | 'NewAuto'; }>; // ?!?!
      count: number;
      last_ids: number;
    }
    isCommonSearch: boolean
    active_marka: any;
    active_model: any;
    active_state: any;
    active_city: any;
    revies: any;
    additional: object;
  }
}

export interface CarEntity {
  UAH: number;
  USD: number;
  EUR: number;
  linkToView: string;
  autoData: {
    [key: string]: any;
  }
  // a lot of stuff
}
