import test from 'ava'

import index from './index'

const {stringifySchema, stringifySchemas} = index;

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
