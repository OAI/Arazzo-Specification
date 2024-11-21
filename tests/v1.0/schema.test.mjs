import { readdirSync, readFileSync } from "node:fs";
import YAML from "yaml";
import { validate, setMetaSchemaOutputFormat } from "@hyperjump/json-schema/draft-2020-12";
import { BASIC } from "@hyperjump/json-schema/experimental";
import { describe, test, expect } from "vitest";

import contentTypeParser from "content-type";
import { addMediaTypePlugin } from "@hyperjump/browser";
import { buildSchemaDocument } from "@hyperjump/json-schema/experimental";

addMediaTypePlugin("application/schema+yaml", {
    parse: async (response) => {
      const contentType = contentTypeParser.parse(response.headers.get("content-type") ?? "");
      const contextDialectId = contentType.parameters.schema ?? contentType.parameters.profile;

      const foo = YAML.parse(await response.text());
      return buildSchemaDocument(foo, response.url, contextDialectId);
    },
    fileMatcher: (path) => path.endsWith(".yaml")
  });

const parseYamlFromFile = (filePath) => {
  const schemaYaml = readFileSync(filePath, "utf8");
  return YAML.parse(schemaYaml, { prettyErrors: true });
};

setMetaSchemaOutputFormat(BASIC);

let validateArazzo;
try {
  validateArazzo = await validate("./schemas/v1.0/schema.yaml");
}
catch (error) {
  console.error(error.output);
  process.exit(1)
}

describe("v1.0", () => {
  describe("Pass", () => {
    readdirSync(`./tests/v1.0/pass`, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.yaml$/.test(entry.name))
      .forEach((entry) => {
        test(entry.name, () => {
          const instance = parseYamlFromFile(`./tests/v1.0/pass/${entry.name}`);
          const output = validateArazzo(instance, BASIC);
          expect(output).to.deep.equal({ valid: true });
        });
      });
  });

  describe("Fail", () => {
    readdirSync(`./tests/v1.0/fail`, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.yaml$/.test(entry.name))
      .forEach((entry) => {
        test(entry.name, () => {
          const instance = parseYamlFromFile(`./tests/v1.0/fail/${entry.name}`);
          const output = validateArazzo(instance, BASIC);
          expect(output.valid).to.equal(false);
        });
      });
  });
});