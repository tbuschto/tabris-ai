import {ImageClassifier} from './ImageClassifier';
import {ImageReader} from './ImageReader';
import {WorkerMessage} from '../src-common/types';
import {MSG_ERROR, MSG_LOG, MSG_READY, MSG_RESULTS} from '../src-common/const';

export class WorkerClient {

  private ai: ImageClassifier = new ImageClassifier();
  private reader: ImageReader = new ImageReader();
  private self = global as unknown as Worker;

  constructor() {
    this.self.onmessage = this.handleMessage.bind(this);
    this.log('Warming up');
    this.ai.init()
      .then(() => this.post({type: MSG_READY}))
      .catch(ex => console.error(ex));
  }

  private async handleMessage({data}: MessageEvent) {
    console.log(arguments);
    try {
      if (!(data instanceof ArrayBuffer)) {
        throw new Error('Worker expected an ArrayBuffer, got ' + data);
      }
      this.log(`Received ${data.byteLength / 1024} KB`);
      await new Promise(r => setTimeout(r));
      this.post({type: MSG_RESULTS, results: await this.classify(data)});
      this.log('Success');
    } catch (ex) {
      console.error(ex);
      this.post({type: MSG_ERROR, message: ex.message, stack: ex.toString()})
    }
  }

  private async classify(encodedImage: ArrayBuffer) {
    const imageData = await this.reader.getImageData(encodedImage);
    return await this.ai.classify(imageData);
  }

  private log(message: string) {
    this.post({type: MSG_LOG, message});
  }

  private post(message: WorkerMessage) {
    this.self.postMessage(message);
  }

}
