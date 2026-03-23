const mediasoup = require('mediasoup');

const runtime = {
  workers: [],
};

function resolveWorkerCount() {
  const parsedCount = Number.parseInt(process.env.MEDIASOUP_WORKERS ?? '4', 10);
  if (!Number.isFinite(parsedCount) || parsedCount < 1) {
    return 1;
  }
  return parsedCount;
}

async function createMediasoupWorkers() {
  if (runtime.workers.length > 0) {
    return runtime.workers;
  }

  const workerCount = resolveWorkerCount();

  if (process.env.MEDIASOUP_FORCE_FAIL === '1') {
    throw new Error('Forced mediasoup startup failure');
  }

  for (let index = 0; index < workerCount; index += 1) {
    const worker = await mediasoup.createWorker();

    worker.on('died', () => {
      console.error(`Mediasoup worker died (index=${index}, pid=${worker.pid})`);
      process.exit(1);
    });

    runtime.workers.push(worker);
  }

  return runtime.workers;
}

function getMediasoupWorker() {
  return runtime.workers[0] ?? null;
}

function getMediasoupWorkers() {
  return [...runtime.workers];
}

async function closeMediasoupWorkers() {
  if (runtime.workers.length === 0) {
    return;
  }

  const currentWorkers = [...runtime.workers];
  runtime.workers = [];

  await Promise.all(currentWorkers.map((worker) => worker.close()));
  console.log(`Mediasoup workers closed (${currentWorkers.length})`);
}

module.exports = {
  createMediasoupWorkers,
  getMediasoupWorker,
  getMediasoupWorkers,
  closeMediasoupWorkers,
};
