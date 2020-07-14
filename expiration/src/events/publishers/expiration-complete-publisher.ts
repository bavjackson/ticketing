import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@bavjacksontickets/common';

export class ExpirationCompletePublisher extends Publisher<
  ExpirationCompleteEvent
> {
  readonly subject = Subjects.ExpirationComplete;
}
