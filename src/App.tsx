import {contentView} from 'tabris';
import {inject} from 'tabris-decorators';
import {MainView} from './MainView';

export class App {

  constructor(@inject main: MainView) {
    contentView.append(main.set({
      left: 0, top: 0, right: 0, bottom: 0
    }));
  }

}
