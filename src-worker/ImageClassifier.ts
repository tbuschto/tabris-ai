import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import {Classification} from '../src-common/types';

export class ImageClassifier {

  private mobilenet: mobilenet.MobileNet;

  async init(): Promise<void> {
    await tf.setBackend('cpu');
    this.mobilenet = await mobilenet.load();
  }

  async classify(image: ImageData): Promise<Classification[]> {
    if (!this.mobilenet) {
      throw new Error('Model not ready');
    }
    return await this.mobilenet.classify(image);
  }

}

