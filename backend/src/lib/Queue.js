import Bee from 'bee-queue';
import redisConfig from '../config/redis';

import SubscriptionMail from '../app/jobs/SubscriptionMail';

// Cada job precisará ser colocado dentro do array.
const jobs = [SubscriptionMail];

class Queue {
  constructor() {
    // Cada tipo de serviço/background job tem uma fila.
    this.queues = {};

    // Divide a inicialização dos jobs
    this.init();
  }

  init() {
    // Percorre os jobs passando os dados desestruturados
    // Armazenamos os jobs dentro do queue que tem a fila que possui a conexão com o mongo
    // Handle processa os jobs
    jobs.forEach(({ key, handle }) => {
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig
        }),
        handle
      };
    });
  }

  // Adiciona os jobs dentro da fila
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: FAILED`, err);
  }
}

export default new Queue();
