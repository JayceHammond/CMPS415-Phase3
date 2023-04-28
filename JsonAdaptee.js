import { json2xml } from "xml-js";
module.exports = class JsonAdaptee {
  convertToXML(JSON) {
    json2xml(JSON, { compact: true, spaces: 4 });
  }
}
