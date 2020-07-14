import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@bavjacksontickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
