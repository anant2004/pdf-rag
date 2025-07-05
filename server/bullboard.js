// bullBoard.js (ESM)
import { ExpressAdapter } from '@bull-board/express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { Queue } from 'bullmq';
import { connection } from './redis.js'; // your shared Redis connection

// Attach to your existing BullMQ queue
const fileUploadQueue = new Queue('file-upload-queue', { connection });

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

createBullBoard({
  queues: [new BullMQAdapter(fileUploadQueue)],
  serverAdapter,
});

export const bullBoardRouter = serverAdapter.getRouter();
