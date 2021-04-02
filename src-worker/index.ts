console.info('Worker START');

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as buffer from 'buffer';

// For TensorFlow:
(global as any).Buffer = buffer.Buffer;

// For Jimp (both used by parts of the library we don't need):
(process as any).versions = {};
(process as any).nextTick = () => undefined as void;

import {WorkerClient} from './WorkerClient';

new WorkerClient();
