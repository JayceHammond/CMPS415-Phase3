export class Adapter extends Target {
  constructor(adaptee) {
    super();
    this.adaptee = adaptee;
  }
  request(JSON) {
    this.adaptee.convertToXml(JSON);
  }
}
