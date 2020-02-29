import puppeteer from 'puppeteer-extra';
import { Browser, LaunchOptions, Page, Request, Response } from 'puppeteer';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { defaultPuppeteerConfiguration } from '../config/puppeteer';

type RequestListeners = (request: Request) => void;
type ResponseListener = (request: Response) => void;

puppeteer.use(StealthPlugin())
export class BrowserService {
  private browser: Browser;
  private currentPage: Page;
  private requestListeners: RequestListeners[];
  private responseListeners: ResponseListener[];

  startBrowser = async (
    props?: {
      config?: LaunchOptions;
      requestListeners?: RequestListeners[];
      responseListeners?: ResponseListener[];
    }
  ) => {
    console.log('startBrowser');
    if (this.browser) {
      throw new Error('Browser already started');
    }
    this.browser = await puppeteer.launch({ ...defaultPuppeteerConfiguration, ...props?.config });
    const pages = await this.browser.pages();
    this.currentPage = pages[0];
    this.requestListeners = props?.requestListeners || [];
    this.responseListeners = props?.responseListeners || [];
    this.requestListeners.forEach(listener => {
      this.currentPage.addListener('request', listener);
    });
    this.responseListeners.forEach(listener => {
      this.currentPage.addListener('response', listener);
    });
    // otherwise we won't be able to intercept http requests for cross domain cobrowse session usage
    // note that each request should be handled or it would just timeout
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#pagesetrequestinterceptionvalue
    if (this.requestListeners.length !== 0) {
      await this.currentPage.setRequestInterception(true);
    }
  }

  reloadPage = async () => {
    await this.currentPage.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
  }

  isActive = () => {
    return !!this.currentPage;
  }

  openPage = async (url: string): Promise<void> => {
    console.log('openPage', url);
    await this.currentPage.goto(url);
  }

  executeScript = async <T>(fn: Function, ...props: any[]): Promise<T> => {
    // @ts-ignore
    return this.currentPage.evaluate(fn, ...props);
  }

  destroy = async (): Promise<void> => {
    this.requestListeners.forEach(listener => {
      this.currentPage.removeListener('request', listener);
    });
    this.responseListeners.forEach(listener => {
      this.currentPage.removeListener('response', listener);
    });
    // TODO: process isn't ended correctly, zombies stay alive(woah)
    // https://github.com/GoogleChrome/puppeteer/issues/1825
    await this.browser.close();
    this.browser = null;
  }
}
