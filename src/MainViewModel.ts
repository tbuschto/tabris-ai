import {Camera, permission, device} from 'tabris';
import {inject, property, shared} from 'tabris-decorators';
import {MobileNetWorker} from './MobileNetWorker';
import {Classification} from '../src-common/types';

@shared
export class MainViewModel {

  @property activeCamera: Camera;
  @property status: string;
  @property availableCameras: Camera[];

  constructor(
    @inject private worker: MobileNetWorker
  ) {
    this.selectCamera(0);
    this.init().catch(ex => console.error(ex));
  }

  async classifyImage() {
    if (!this.worker.isReady()) {
      console.warn('not ready');
      return;
    }
    const {image} = await this.activeCamera.captureImage();
    this.status = 'working';
    const timestamp = Date.now();
    const results = await this.worker.classify(image);
    console.info(Date.now() - timestamp, 'ms');
    this.showResults(results);
  }

  private async init() {
    this.status = 'initializing';
    await this.worker.ready();
    this.status = 'ready';
  }

  private showResults(results: Classification[]) {
    if (results[0].probability > 0.5) {
      this.status = `This is a ${results[0].className.split(',')[0]}`;
    } else {
      this.status = '???';
    }
  }

  private selectCamera(index: number) {
    this.activeCamera?.set({active: false});
    permission.withAuthorization('camera',
      () => this.activeCamera = device.cameras[index].set({
        active: true,
        captureResolution: {width: 1000, height: 1000}
      }),
      () => this.status = '"camera" permission is required.',
      ex => this.status = ex.message
    );
  }

}
