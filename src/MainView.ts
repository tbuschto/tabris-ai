import {Stack, CameraView, TextView, ActivityIndicator, Camera} from 'tabris';
import {component, bindAll, inject, shared, ItemPicker} from 'tabris-decorators';
import {MainViewModel} from './MainViewModel';
import {resToString} from './util';

@shared
@component
export class MainView extends Stack {

  @inject
  @bindAll<MainViewModel>({
    availableCameras: '>> #camera.items',
    camera: '#camera.selection',
    availableResolutions: '>> #resolution.items',
    resolution: '#resolution.selection',
    activeCamera: '>> CameraView.camera',
    working: '>> ActivityIndicator.visible',
    status: '>> #status.text'
  })
  model: MainViewModel;

  constructor() {
    super({padding: 16, spacing: 16, alignment: 'stretchX'});
    this
      .append(
        ItemPicker({id: 'camera', message: 'Camera', textSource: 'position'}),
        ItemPicker({
          id: 'resolution',
          message: 'Resolution',
          textSource: 'width'
        }),
        CameraView({
          stretchX: true,
          scaleMode: 'fill',
          onBoundsChanged: ({target, value}) => target.height = value.width
        }),
        TextView({id: 'status'}),
        ActivityIndicator()
      );
  }

}
