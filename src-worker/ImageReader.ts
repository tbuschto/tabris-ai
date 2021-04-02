import {Buffer} from 'buffer';
import Jimp from 'jimp';

export class ImageReader {

  async getImageData(encoded: ArrayBuffer): Promise<ImageData> {
    const image = await Jimp.read(Buffer.from(encoded));
    return new ImageData(
      Uint8ClampedArray.from(image.bitmap.data),
      image.bitmap.width,
      image.bitmap.height
    );
  }

}
