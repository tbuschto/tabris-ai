import {Camera, permission, device, ChangeListeners} from 'tabris';
import {event, inject, property, shared} from 'tabris-decorators';
import {MobileNetWorker} from './MobileNetWorker';
import {resToString} from './util';
import {WorkerPool} from './WorkerPool';
import {Classification} from '../src-common/types';

const LIKELY = 0.55;
const POSSIBLY = 0.3;
const NO_WAY = 0.1;

@shared
export class MainViewModel {

  @property camera: Camera;
  @property activeCamera: Camera;
  @property resolution: {width: number, height: number};
  @property status: string;
  @property working: boolean = false;
  @property availableCameras: Camera[] = device.cameras;
  @property availableResolutions: Array<{width: number, height: number}>;

  @event onCameraChanged: ChangeListeners<MainViewModel, 'camera'>;
  @event onResolutionChanged: ChangeListeners<MainViewModel, 'resolution'>;

  constructor(
    @inject private workers: WorkerPool
  ) {
    this.onResolutionChanged(() => this.handleResolutionChanged());
    this.onCameraChanged(() => this.handleCameraChanged());
    this.init().catch(ex => console.error(ex));
  }

  private async init() {
    this.status = 'initializing';
    await this.workers.ready();
    this.camera = this.availableCameras[0];
    this.status = 'working';
    for (let i = 0; i < this.workers.length; i++) {
      this.scheduleClassifyImage(this.workers.getWorker(i));
      await new Promise(cb => setTimeout(cb, 4000 / this.workers.length));
    }
  }

  private scheduleClassifyImage(worker: MobileNetWorker) {
    setTimeout(
      () => this.classifyImage(worker).catch(ex => this.handleClassificationError(ex)),
      300
    );
  }

  private async classifyImage(worker: MobileNetWorker) {
    if (!worker.isReady()) {
      console.warn('not ready');
      return;
    }
    if (!this.camera.active) {
      this.camera.active = true;
    }
    const timestamp = Date.now();
    const {image} = await this.camera.captureImage();
    this.working = true;
    const results = await worker.classify(image);
    this.working = false;
    // TODO: ignore outdated classifications
    this.showResults(results, Date.now() - timestamp);
    // TODO: schedule classification so results arrive at roughly stable intervals
    this.scheduleClassifyImage(worker);
  }

  private showResults(results: Classification[], time: number) {
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
    text.push(` (${Math.round(time / 100) / 10}s)`);
    this.status = text.join('');
  }

  private getName({className}: Classification) {
    const name = className.split(',')[0];
    const article = /^[aeiou]/.test(name) ? 'an' : 'a';
    return article + ' ' + name;
  }

  private handleResolutionChanged() {
    console.info(`Resolution: ${resToString(this.resolution)}`);
    this.camera.captureResolution = this.resolution;
  }

  private handleCameraChanged() {
    permission.withAuthorization('camera',
      () => {
        this.activeCamera = this.camera?.set({active: false});
        this.availableResolutions = this.camera?.availableCaptureResolutions
          .sort((resA, resB) => resA.width - resB.width);
        this.resolution = this.availableResolutions?.find(res => res.width > 1000);
      },
      () => this.status = '"camera" permission is required.',
      ex => this.status = ex.message
    );
  }

  private handleClassificationError(ex: Error) {
    console.error('Classification error:', ex);
    this.status = `Classification error ${ex.message}`;
  }

}
