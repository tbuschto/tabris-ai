import {Camera} from 'tabris';

export abstract class ImageReader {

  abstract getImageData(camera: Camera): Promise<ImageData>;

}
