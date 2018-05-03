
import {api08} from 'raml-1-parser'
import {JSONSchema4} from 'json-schema'
import $RefParser = require('json-schema-ref-parser');

interface Schema {
  [key: string]: JSONSchema4
}
interface StringifiedSchema {
  [key: string]: string
}
interface RamlJson {
  schemas: StringifiedSchema
}

export function dereference(schemas: Schema[]): Promise<Schema[]>;
export function dereference(schemas: Schema[], callback: (err: Error | undefined, result: Schema[]) => void): void

export interface Exploded {
  parsed: Schema[]
  map: Schema
  list: JSONSchema4[]
}

export function explode(schemas: any[]): Exploded;

export function fixRaml<T extends RamlJson>(raml: T | api08.Api): T;

export function refake(schemaList: Exploded['list']): Promise<$RefParser.$Refs>;

export function stringifySchema(schema: Schema): StringifiedSchema;

export function stringifySchemas(schemas: Schema[]): StringifiedSchema[];
