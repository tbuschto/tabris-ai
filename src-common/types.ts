import {MSG_ERROR, MSG_LOG, MSG_READY, MSG_RESULTS} from './const';

export type Classification = { className: string, probability: number };
export type Results = Classification[];
export type WorkerMessage =
    {type: typeof MSG_ERROR, message: string, stack: string}
  | {type: typeof MSG_LOG, message: string}
  | {type: typeof MSG_READY}
  | {type: typeof MSG_RESULTS, results: Results};
