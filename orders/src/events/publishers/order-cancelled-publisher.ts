import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@bavjacksontickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
