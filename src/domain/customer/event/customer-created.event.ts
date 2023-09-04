import EventInterface from "../../@shared/event/event.interface";

export class CustomerCreated {
  readonly occurred_on: Date
  readonly event_version: number = 1;

  constructor(
      readonly aggregate_id: string,
      readonly name: string
  ){
      this.occurred_on = new Date();
  }
}
