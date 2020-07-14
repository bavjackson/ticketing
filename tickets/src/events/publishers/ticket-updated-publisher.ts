import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from '@bavjacksontickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
