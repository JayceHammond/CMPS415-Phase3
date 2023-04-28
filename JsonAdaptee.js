class JsonAdaptee {
  constructor() {
    super();
  }
  convertToXML(JSON) {
    json2xml(JSON, { compact: true, spaces: 4 });
  }
}
