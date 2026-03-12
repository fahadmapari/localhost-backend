import { Queue, Worker } from "bullmq";
import { createQueueConnection } from "../config/queue";
import { syncProductEmbedding } from "../services/product-embedding.service";

const PRODUCT_EMBEDDING_QUEUE_NAME = "product-embedding";

type ProductEmbeddingJobData = {
  baseProductId: string;
};

const productEmbeddingQueue = new Queue<ProductEmbeddingJobData>(
  PRODUCT_EMBEDDING_QUEUE_NAME,
  {
    connection: createQueueConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 1000,
      removeOnFail: 5000,
    },
  },
);

export const enqueueProductEmbeddingJob = async (baseProductId: string) => {
  await productEmbeddingQueue.add(
    "sync-product-embedding" as const,
    { baseProductId },
    {
      jobId: `product-embedding:${baseProductId}`,
    },
  );
};

export const startProductEmbeddingWorker = () => {
  const worker = new Worker<ProductEmbeddingJobData>(
    PRODUCT_EMBEDDING_QUEUE_NAME,
    async (job) => {
      await syncProductEmbedding(job.data.baseProductId);
    },
    {
      connection: createQueueConnection(),
      concurrency: 2,
    },
  );

  worker.on("completed", (job) => {
    console.log(`Completed embedding job ${job.id}`);
  });

  worker.on("failed", (job, error) => {
    console.error(`Failed embedding job ${job?.id}`, error);
  });

  return worker;
};
