import {EventObject, Listeners} from 'tabris';
import {event, injectable} from 'tabris-decorators';
import {MSG_ERROR, MSG_LOG, MSG_READY, MSG_RESULTS} from '../src-common/const';
import {Classification, WorkerMessage} from '../src-common/types';

let instanceCounter = 0;

@injectable
export class MobileNetWorker {

  @event onReady: Listeners<MobileNetWorkerEvent>;
  @event onResults: Listeners<MobileNetWorkerResultsEvent>;
  @event onError: Listeners<MobileNetWorkerEvent>;
  @event onLog: Listeners<MobileNetWorkerLogEvent>;

  readonly instanceNo = instanceCounter++;

  private self = new Worker('dist/worker.js');
  private _ready = false;
  private _busy = false;

  constructor() {
    this.self.onmessage = this.handleMessage.bind(this);
    this.self.onerror = this.handleError.bind(this);
    this.self.onmessageerror = this.handleError.bind(this);
    this.onReady.once(() => this._ready = true);
    this.onLog(ev => this.log('Remote: ' + ev.message));
  }

  isReady() {
    return this._ready;
  }

  async ready(): Promise<void> {
    if (this._ready) {
      return;
    }
    await this.onReady.promise();
    return;
  }

  async classify(encodedImage: Blob): Promise<Classification[]> {
    if (!this.ready()) {
      throw new Error('Worker is not ready');
    }
    if (this._busy) {
      throw new Error('Worker is busy');
    }
    this._busy = true;
    try {
      const arrayBuffer = await encodedImage.arrayBuffer();
      const promise = Promise.race([
        this.onResults.promise(),
        this.onError.promise()
      ]);
      this.postClassify(arrayBuffer);
      const ev = await promise;
      if (ev instanceof MobileNetWorkerErrorEvent) {
        throw ev.error;
      } else if (ev instanceof MobileNetWorkerResultsEvent) {
        return ev.results;
      }
      throw new Error('Unexpected event ' + ev);
    } finally {
      this._busy = false;
    }
  }

  private postClassify(encodedImage: ArrayBuffer) {
    this.log(`Sending ${encodedImage.byteLength / 1024} KB`);
    this.self.postMessage(encodedImage);
  }

  private handleMessage(ev: MessageEvent) {
    const message: WorkerMessage = ev.data;
    if (message.type === MSG_READY) {
      this.onReady.trigger(new MobileNetWorkerEvent());
    } else if (message.type === MSG_LOG) {
      this.onLog.trigger(new MobileNetWorkerLogEvent(message.message));
    } else if (message.type === MSG_ERROR) {
      const error = new Error(message.message);
      error.toString = () => message.stack;
      this.onError.trigger(new MobileNetWorkerErrorEvent(error));
    } else if (message.type === MSG_RESULTS) {
      this.onResults.trigger(new MobileNetWorkerResultsEvent(message.results));
    } else {
      const error = new Error('Unexpected message ' + JSON.stringify(message));
      this.onError.trigger(new MobileNetWorkerErrorEvent(error));
    }
  }

  private handleError(ev: Event) {
    const error = new Error(JSON.stringify(ev)); // Not sure where message
    this.log(error);
    this.onError.trigger(new MobileNetWorkerErrorEvent(error));
  }

  private log(msg: string | Error) {
    if (msg instanceof Error) {
      console.error(this.constructor.name, this.instanceNo, msg.message);
    } else {
      console.info(this.constructor.name, this.instanceNo, msg);
    }
  }

}

export class MobileNetWorkerEvent extends EventObject<{target: MobileNetWorker}> {}

export class MobileNetWorkerResultsEvent extends MobileNetWorkerEvent {

  constructor(public results: Classification[]) {super();}

}

export class MobileNetWorkerErrorEvent extends MobileNetWorkerEvent {

  constructor(public error: Error) {super();}

}

export class MobileNetWorkerLogEvent extends MobileNetWorkerEvent {

  constructor(public message: string) {super();}

}

