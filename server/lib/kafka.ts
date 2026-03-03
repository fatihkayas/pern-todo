import { Kafka, Producer } from "kafkajs";



const kafka = new Kafka({
  clientId: "seiko-backend",
  brokers: [process.env.KAFKA_BROKER || "seiko_redpanda:9092"],
});

let producer: Producer;

export async function initKafka(): Promise<void> {
  producer = kafka.producer();
  await producer.connect();
  console.log("✅ Kafka producer connected");
}

export async function publishOrderEvent(order: any): Promise<void> {
  if (!producer) {
    throw new Error("Kafka producer not initialized");
  }

  await producer.send({
    topic: "orders",
    messages: [
      {
        key: String(order.id),
        value: JSON.stringify(order),
      },
    ],
  });
}