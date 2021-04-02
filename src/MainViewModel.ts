import {Camera, permission, device} from 'tabris';
import {inject, property, shared} from 'tabris-decorators';
import {MobileNetWorker} from './MobileNetWorker';
import {Classification} from '../src-common/types';

const LIKELY = 0.55;
const POSSIBLY = 0.3;
const NO_WAY = 0.1;

@shared
export class MainViewModel {

  @property activeCamera: Camera;
  @property status: string;
  @property working: boolean = false;
  @property availableCameras: Camera[];

  constructor(
    @inject private worker: MobileNetWorker
  ) {
    this.init().catch(ex => console.error(ex));
  }

  private async init() {
    this.status = 'initializing';
    await this.worker.ready();
    this.selectCamera(0);
    this.status = 'working';
    this.scheduleClassifyImage();
  }

  private scheduleClassifyImage() {
    setTimeout(
      () => this.classifyImage().catch(ex => this.handleClassificationError(ex)),
      300
    );
  }

  private async classifyImage() {
    if (!this.worker.isReady()) {
      console.warn('not ready');
      return;
    }
    if (!this.activeCamera.active) {
      this.activeCamera.active = true;
    }
    const timestamp = Date.now();
    const {image} = await this.activeCamera.captureImage();
    this.working = true;
    const results = await this.worker.classify(image);
    this.working = false;
    console.info('Classification in ' + (Date.now() - timestamp) +  'ms');
    this.showResults(results);
    this.scheduleClassifyImage();
  }

  private showResults(results: Classification[]) {
    console.info(results);
    const text: string[] = [];
    if (results[0].probability > LIKELY) {
      text.push('This is ', this.getName(results[0]));
      if (results[1].probability > LIKELY) {
        text.push(' or ', this.getName(results[1]));
      }
      text.push('.');
    } else if (results[0].probability > POSSIBLY) {
      text.push('Could be ', this.getName(results[0]));
      if (results[1].probability > POSSIBLY) {
        text.push(' or ', this.getName(results[1]));
      }
      text.push('.');
    } else if (results[0].probability > NO_WAY) {
      text.push('I have no idea what this is.');
    } else {
      text.push('I can\'t see a thing.');
    }
    this.status = text.join('');
  }

  private getName({className}: Classification) {
    const name = className.split(',')[0];
    const article = /^[aeiou]/.test(name) ? 'an' : 'a';
    return article + ' ' + name;
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

  private handleClassificationError(ex: Error) {
    console.error('Classification error:', ex);
    this.status = `Classification error ${ex.message}`;
    this.scheduleClassifyImage();
  }

}
