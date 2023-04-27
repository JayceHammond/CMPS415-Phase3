require("Adaptor.js");
require("JsonAdaptee.js");
require("Target.js");

class JsonAdaptee {
  convertToXML(JSON) {
    json2xml(JSON, { compact: true, spaces: 4 });
  }
}
