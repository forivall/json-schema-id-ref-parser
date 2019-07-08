
var path = require('path');
var url = require('url');

var refaker = require('refaker-local-id');

var $RefParser = require('json-schema-ref-parser');

var maybe = require('call-me-maybe');

module.exports.dereference = function (schemas, callback) {
  return dereference(schemas)
  .then(function (result) {
    return maybe(callback, Promise.resolve(result));
  })
  .catch(function (err) {
    return maybe(callback, Promise.reject(err));
  });
};

function dereference(schemas) {
  var schemaParts = explode(schemas);

  return refake(schemaParts.list)
  .then(_dereference.bind(null, schemaParts));
}

module.exports.explode = explode;
function explode(schemas) {
  var schemaMap = {};
  var schemaList = [];
  var parsedSchemas = schemas.map(function (schema) {
    var parsedSchema = {};
    var schemaKeys = Object.keys(schema);
    for (var i = 0; i < schemaKeys.length; i++) {
      var schemaKey = schemaKeys[i];
      var schemaBody = schema[schemaKey];
      if (typeof schemaBody === 'string') {
        try {
          schemaBody = JSON.parse(schemaBody);
        } catch (err) {}
      }
      parsedSchema[schemaKey] = schemaBody;

      var id = schemaBody.id;
      if (id != null) {
        // TODO: collision detection
        schemaMap[id] = schemaBody;
      }
      schemaList.push(schemaBody);
    }
    return parsedSchema;
  });
  return {
    parsed: parsedSchemas,
    map: schemaMap,
    list: schemaList
  };
}

module.exports.refake = refake;
function refake(schemaList) {
  return new Promise(function (resolve, reject) {
    refaker({schemas: schemaList}, function (err, refs) {
      if (err) return reject(err);
      resolve(refs);
    });
  });
}

module.exports._dereference = _dereference;
function _dereference(schemaParts, refs) {
  var schemaMap = schemaParts.map;
  var parsedSchemas = schemaParts.parsed;

  var cwd = process.cwd();
  var idResolver = createIdResolver(schemaMap, cwd);

  // TODO: flatten this
  return Promise.all(parsedSchemas.map(function (schema) {
    return Promise.all(Object.keys(schema).map(function (schemaKey) {
      var parser = new $RefParser();
      Object.keys(refs).forEach(function (ref) {
        var local = path.join(cwd, refs[ref].id);
        parser.$refs._add(ref, refs[ref]);
        parser.$refs._add(local, refs[ref]);
      });

      var schemaBody = schema[schemaKey];
      return parser.bundle(schemaBody, {resolve: {mem: idResolver}})
      .then(function (bundledSchemaBody) {
        return [schemaKey, bundledSchemaBody];
      })
      ;
    })).then(function (schemaEntries) {
      var schema = {};
      for (var i = 0; i < schemaEntries.length; i++) {
        var entry = schemaEntries[i];
        schema[entry[0]] = entry[1];
      }
      return schema;
    });
  }));
}

function createIdResolver(ids, cwd) {
  return {
    order: 0,
    canRead: function (file) {
      var urlObj = url.parse(file.url);
      var protocol = urlObj.protocol;
      if (!(protocol === 'file:' || protocol == null)) return false;
      var key = path.relative(cwd, urlObj.path);
      return key in ids;
    },
    read: function (file) {
      var urlObj = url.parse(file.url);
      var key = path.relative(cwd, urlObj.path);
      return Promise.resolve(ids[key]);
    }
  };
}

module.exports.stringifySchemas = stringifySchemas;
function stringifySchemas(schemas) {
  return schemas.map(stringifySchema);
}

module.exports.stringifySchema = stringifySchema;
function stringifySchema(schema) {
  var stringifiedSchema = {};
  var schemaKeys = Object.keys(schema);
  for (var i = 0; i < schemaKeys.length; i++) {
    var schemaKey = schemaKeys[i];
    var schemaBody = schema[schemaKey];
    stringifiedSchema[schemaKey] = JSON.stringify(schemaBody);
  }
  return stringifiedSchema;
}

module.exports.fixRaml = fixRaml;
function fixRaml(raml) {
  if (typeof raml.toJSON === 'function') raml = raml.toJSON();
  if (raml.schemas == null) return raml;

  return dereference(raml.schemas)
  .then(stringifySchemas)
  .then(function (schemas) {
    raml.schemas = schemas;
    return raml;
  });
}
