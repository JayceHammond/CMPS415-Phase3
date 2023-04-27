class JsonAdaptee {
  convertToXML(JSON) {
    json2xml(JSON, { compact: true, spaces: 4 });
  }
}
