# OpenAPI Arazzo 1.0.x JSON Schema

Here you can find the JSON Schema for validating Arazzo Documents conforming to versions 1.0.x.

As a reminder, the JSON Schema is not the source of truth for the Specification.
In cases of conflicts between the Specification itself and the JSON Schema, the
Specification wins. Also, some Specification constraints cannot be represented
with the JSON Schema so it's highly recommended to employ other methods to
ensure compliance.

The iteration version of the JSON Schema can be found in the `$id` field.
For example, the value of `$id: https://spec.openapis.org/arazzo/1.0/schema/2024-10-17` means this iteration was created on October 17, 2024.

## Contributing

To submit improvements to the schema, modify the `schema.yaml` and add test cases for your changes.

The TSC will then:
- Run tests on the updated schema
- Update the iteration version
- Publish the new version

## Tests

The [test suite](../../tests/v1.0) is part of this package.

```bash
npm install
npm test
```

You can also validate a document individually.

```bash
node scripts/validate.mjs path/to/document/to/validate.yaml
```