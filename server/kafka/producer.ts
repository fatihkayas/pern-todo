import { Kafka, Producer } from "kafkajs";

export interface OrderEvent {
  orderId: number;
  customerId: number | null;
  totalAmount: string;
  items: { watchId: string; quantity: number; unitPrice: string }[];
  timestamp: string;
}

let producer: Producer | null = null;

function getProducer(): Producer {
  if (!producer) {
    const kafka = new Kafka({
      clientId: "seiko-backend",
      brokers: [process.env.KAFKA_BROKER || "localhost:29092"],
    });
    producer = kafka.producer();
  }
  return producer;
}

export async function publishOrderEvent(event: OrderEvent): Promise<void> {
  const p = getProducer();
  await p.connect();
  await p.send({
    topic: "orders.created",
    messages: [{ key: String(event.orderId), value: JSON.stringify(event) }],
  });
}
