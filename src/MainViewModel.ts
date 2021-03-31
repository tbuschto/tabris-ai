import {Camera, permission, device} from 'tabris';
import {inject, property, shared} from 'tabris-decorators';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import {ImageReader} from './ImageReader';

@shared
export class MainViewModel {

  @property activeCamera: Camera;
  @property status: string;
  @property availableCameras: Camera[];

  private mobilenet: mobilenet.MobileNet;
  private working = false;

  constructor(
    @inject private imageReader: ImageReader
  ) {
    this.selectCamera(0);
    this.initTensorFlow().catch(ex => this.status = ex.toString());
  }

  async classifyImage() {
    if (this.mobilenet && !this.working) {
      const start = Date.now();
      this.working = true;
      try {
        const image = await this.imageReader.getImageData(this.activeCamera);
        const imageRead = Date.now();
        const results = await this.mobilenet.classify(image);
        console.info('Image processing time:', imageRead - start, 'ms');
        console.info('Image classification time:', Date.now() - imageRead, 'ms');
        console.info(results);
        this.showResults(results);
      } catch (ex) {
        this.status = ex.message;
        console.error(ex);
      } finally {
        this.working = false;
      }
      void this.classifyImage();
    }
  }

  private showResults(results: Array<{ className: string, probability: number }>) {
    if (results[0].probability > 0.5) {
      this.status = `This is a ${results[0].className.split(',')[0]}`;
    } else {
      this.status = '???';
    }
  }

  private selectCamera(index: number) {
    this.activeCamera?.set({active: false});
    permission.withAuthorization('camera',
      () => this.activeCamera = device.cameras[index].set({active: true}),
      () => this.status = '"camera" permission is required.',
      ex => this.status = ex.message
    );
  }

  private async initTensorFlow() {
    this.status = 'Initializing...';
    await tf.setBackend('cpu');
    this.mobilenet = await mobilenet.load();
    this.status = 'Looking at image...';
    void this.classifyImage();
  }

}
