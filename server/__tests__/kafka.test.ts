const mockSend = jest.fn().mockResolvedValue(undefined);
const mockConnect = jest.fn().mockResolvedValue(undefined);
const mockProducer = jest.fn().mockReturnValue({ connect: mockConnect, send: mockSend });

jest.mock("kafkajs", () => ({
  Kafka: jest.fn().mockImplementation(() => ({ producer: mockProducer })),
}));

import { publishOrderEvent, OrderEvent } from "../kafka/producer";

const sampleEvent: OrderEvent = {
  orderId: 1,
  customerId: 42,
  totalAmount: "299.99",
  items: [{ watchId: "abc-123", quantity: 2, unitPrice: "149.99" }],
  timestamp: new Date().toISOString(),
};

describe("Kafka producer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("connects and sends the event to orders.created topic", async () => {
    await publishOrderEvent(sampleEvent);

    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith({
      topic: "orders.created",
      messages: [
        {
          key: String(sampleEvent.orderId),
          value: JSON.stringify(sampleEvent),
        },
      ],
    });
  });

  it("serialises customerId: null correctly", async () => {
    const nullCustomer: OrderEvent = { ...sampleEvent, customerId: null };
    await publishOrderEvent(nullCustomer);

    const sent = mockSend.mock.calls[0][0];
    const payload = JSON.parse(sent.messages[0].value);
    expect(payload.customerId).toBeNull();
  });
});
