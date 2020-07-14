import {
  Publisher,
  Subjects,
  PaymentCreatedEvent,
} from '@bavjacksontickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
