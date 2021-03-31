import {Buffer} from 'buffer';
import {Camera} from 'tabris';
import {injectable} from 'tabris-decorators';
import Jimp from 'jimp';
import {ImageReader} from './ImageReader';

const SQUARE = 1000;

@injectable({shared: true, implements: ImageReader})
export class ImageReaderJimp {

  async getImageData(camera: Camera): Promise<ImageData> {
    console.info('Use ImageReaderJimp');
    camera.captureResolution = {height: SQUARE, width: SQUARE};
    const capture = await camera.captureImage();
    const buf = Buffer.from(await capture.image.arrayBuffer());
    const image = await Jimp.read(buf);
    return new ImageData(
      Uint8ClampedArray.from(image.bitmap.data),
      image.bitmap.width,
      image.bitmap.height
    );
  }

}
