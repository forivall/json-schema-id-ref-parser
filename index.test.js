import path from 'path'

import test from 'ava'

import ramlParser from 'raml-1-parser'

import index from './index'

const {
  stringifySchema,
  stringifySchemas,
  fixRaml,
} = index

test.todo('dereference')

test('stringifySchema', (t) => {
  t.deepEqual(
    stringifySchema({foo: {id: 'bar'}, baz: {id: 'feh'}}),
    {foo: '{"id":"bar"}', baz: '{"id":"feh"}'}
  )
})

test('stringifySchemas', (t) => {
  t.deepEqual(
    stringifySchemas([{foo: {id: 'bar'}}, {baz: {id: 'feh'}}]),
    [{foo: '{"id":"bar"}'}, {baz: '{"id":"feh"}'}]
  )
})

test('fixRaml', async (t) => {
  const raml = await ramlParser.loadApi(path.join(__dirname, 'fixtures/xkcd.raml'))
  const schemas = (await fixRaml(raml)).schemas
  t.deepEqual(JSON.parse(schemas[1].comics).items, JSON.parse(schemas[0].comic))
})
