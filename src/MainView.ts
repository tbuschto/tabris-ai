import {Stack, CameraView, TextView, ActivityIndicator} from 'tabris';
import {component, bindAll, inject, shared} from 'tabris-decorators';
import {MainViewModel} from './MainViewModel';

@shared
@component
export class MainView extends Stack {

  @inject
  @bindAll({
    working: '>> ActivityIndicator.visible',
    activeCamera: '>> CameraView.camera',
    status: '>> #status.text'
  })
  model: MainViewModel;

  constructor() {
    super({padding: 16, spacing: 16, alignment: 'stretchX'});
    this
      .append(
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
