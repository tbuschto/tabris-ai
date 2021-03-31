/* eslint-disable @typescript-eslint/no-explicit-any */
import * as buffer from 'buffer';

console.info('Application START');

// For TensorFlow:
(global as any).Buffer = buffer.Buffer;

// For Jimp (both used by parts of the library we don't need):
(process as any).versions = {};
(process as any).nextTick = () => undefined as void;

import {create} from 'tabris-decorators';
import {App} from './App';
// Import either to use for image processing (Jimp is slightly faster)
import './ImageReaderJimp';
// import './ImageReaderCanvas';

create(App);
