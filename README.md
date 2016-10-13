# json-schema-id-ref-parser

Resolves and dereferences  pointers to schemas with an "id" property

[![build status](https://secure.travis-ci.org/forivall/json-schema-id-ref-parser.svg)](http://travis-ci.org/forivall/json-schema-id-ref-parser)
[![dependency status](https://david-dm.org/forivall/json-schema-id-ref-parser.svg)](https://david-dm.org/forivall/json-schema-id-ref-parser)
[![coverage status](https://coveralls.io/repos/github/forivall/json-schema-id-ref-parser/badge.svg)](https://coveralls.io/github/forivall/json-schema-id-ref-parser)

## Installation

```
npm install --save json-schema-id-ref-parser
```

## Usage

```js
var ramlParser = require('raml-1-parser');
var idRefParser = require('json-schema-id-ref-parser');

module.exports = loadRaml;
function loadRaml(filename, options) {
  var raml = ramlParser.loadApiSync(filename, options);
  var ramlJson = raml.toJSON();

  return idRefParser.dereference(ramlJson.schemas)
  .then(idRefParser.stringifySchemas)
  .then((schemas) => {
    ramlJson.schemas = schemas;
    return ramlJson;
  })
  ;
}
```

## Credits
[Jordan Klassen](https://github.com/forivall/)

## License

ISC
