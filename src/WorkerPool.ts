import {shared, Injector} from 'tabris-decorators';
import {MobileNetWorker} from './MobileNetWorker';

@shared
export class WorkerPool {

  private readonly workers: MobileNetWorker[] = [];

  constructor(
    readonly length: number = 3
  ) {
    for (let i = 0; i < length; i++) {
      this.workers[i] = Injector.get(this).resolve(MobileNetWorker);
    }
  }

  async ready() {
    return await Promise.all(this.workers.map(worker => worker.ready()));
  }

  getWorker(index: number) {
    return this.workers[index];
  }

}
