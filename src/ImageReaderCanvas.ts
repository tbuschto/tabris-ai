import {Camera, Canvas, CanvasContext, contentView} from 'tabris';
import {injectable} from 'tabris-decorators';
import {ImageReader} from './ImageReader';

const SQUARE = 1000;

@injectable({shared: true, implements: ImageReader})
export class ImageReaderCanvas {

  private canvas: Canvas;
  private ctx: CanvasContext;

  constructor() {
    this.canvas = new Canvas({
      width: SQUARE,
      height: SQUARE,
      visible: false,
      elevation: 2
    }).appendTo(contentView);
    this.ctx = this.canvas.getContext('2d', SQUARE, SQUARE);
  }

  async getImageData(camera: Camera): Promise<ImageData> {
    console.info('Use ImageReaderCanvas');
    camera.captureResolution = {height: SQUARE, width: SQUARE};
    const capture = await camera.captureImage();
    const longer = Math.max(capture.height, capture.width);
    const scale = Math.min(SQUARE / longer, 1);
    const resizeWidth = capture.width * scale;
    const resizeHeight = capture.height * scale;
    const image = await createImageBitmap(capture.image, {resizeWidth, resizeHeight});
    this.ctx.clearRect(0, 0, SQUARE, SQUARE);
    this.ctx.drawImage(image, 0, 0);
    const imageData = this.ctx.getImageData(0, 0, resizeWidth, resizeHeight);
    image.close();
    return imageData;
  }

}
