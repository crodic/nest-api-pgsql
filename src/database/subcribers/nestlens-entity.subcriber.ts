import { EntitySubscriberInterface, EventSubscriber } from 'typeorm';

@EventSubscriber()
export class NestLensEntitySubscriber implements EntitySubscriberInterface {}
