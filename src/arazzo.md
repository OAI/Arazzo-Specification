# Arazzo Specification

## Version 1.1.0

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" in this document are to be interpreted as described in [BCP 14](https://tools.ietf.org/html/bcp14) [RFC2119](https://tools.ietf.org/html/rfc2119) [RFC8174](https://tools.ietf.org/html/rfc8174) when, and only when, they appear in all capitals, as shown here.

This document is licensed under [The Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0.html).

## Introduction

Being able to express specific sequences of calls and articulate the dependencies between them to achieve a particular goal is desirable in the context of API descriptions. The aim of the Arazzo Specification is to provide a mechanism that can define sequences of calls and their dependencies to be woven together and expressed in the context of delivering a particular outcome or set of outcomes when dealing with API descriptions (such as OpenAPI descriptions).

The Arazzo Specification can articulate these workflows in a human-readable and machine-readable manner, thus improving the capability of API specifications to tell the story of the API in a manner that can improve the consuming developer experience.

<!-- TOC depthFrom:1 depthTo:3 withLinks:1 updateOnSave:1 orderedList:0 -->
## Table of Contents

- [Definitions](#definitions)
  - [Arazzo Description](#arazzo-description)
- [Specification](#specification)
  - [Versions](#versions)
  - [Format](#format)
  - [Arazzo Description Structure](#arazzo-description-structure)
  - [Data Types](#data-types)
  - [Parsing Documents](#parsing-documents)
    - [Fragmentary Parsing](#fragmentary-parsing)
    - [Identity-Based Referencing](#identity-based-referencing)
  - [Relative References in Arazzo Description URIs](#relative-references-in-arazzo-description-uris)
    - [Establishing the Base URI](#establishing-the-base-uri)
    - [Resolving URI Fragments](#resolving-uri-fragments)
    - [Relative URI References in CommonMark Fields](#relative-uri-references-in-commonmark-fields)
  - [Relative References in API URLs](#relative-references-in-api-urls)
  - [Schema](#schema)
    - [Arazzo Specification Object](#arazzo-specification-object)
    - [Info Object](#info-object)
    - [Source Description Object](#source-description-object)
    - [Workflow Object](#workflow-object)
    - [Step Object](#step-object)
    - [Parameter Object](#parameter-object)
    - [Success Action Object](#success-action-object)
    - [Failure Action Object](#failure-action-object)
    - [Components Object](#components-object)
    - [Reusable Object](#reusable-object)
    - [Criterion Object](#criterion-object)
    - [Expression Type Object](#expression-type-object)
    - [Selector Object](#selector-object)
    - [Request Body Object](#request-body-object)
    - [Payload Replacement Object](#payload-replacement-object)
  - [Runtime Expressions](#runtime-expressions)
  - [Specification Extensions](#specification-extensions)
  - [Security Considerations](#security-considerations)
  - [IANA Considerations](#iana-considerations)
- [Appendix A: Revision History](#appendix-a-revision-history)
- [Appendix B: Examples of Base URI Determination and Reference Resolution](#appendix-b-examples-of-base-uri-determination-and-reference-resolution)
<!-- /TOC -->

## Definitions

### Arazzo Description

A self-contained document (or set of documents) which defines or describes API workflows (specific sequence of calls to achieve a particular goal in the context of an API definition). An Arazzo Description uses and conforms to the Arazzo Specification, and `MUST` contain a valid Arazzo Specification version field (`arazzo`), an [info](#info-object) field, a `sourceDescriptions` field with at least one defined [Source Description](#source-description-object), and there `MUST` be at least one [Workflow](#workflow-object) defined in the `workflows` fixed field.

## Specification

### Versions

The Arazzo Specification is versioned using a `major`.`minor`.`patch` versioning scheme. The `major`.`minor` portion of the version string (for example 1.0) SHALL designate the Arazzo feature set. `.patch` versions address errors in, or provide clarifications to, this document, not the feature set. The patch version SHOULD NOT be considered by tooling, making no distinction between 1.0.0 and 1.0.1 for example.

### Format

An Arazzo Description that conforms to the Arazzo Specification is itself a JSON object, which may be represented either in JSON or YAML format.

All field names in the specification are **case sensitive**.
This includes all fields that are used as keys in a map, except where explicitly noted that keys are **case insensitive**.

In order to preserve the ability to round-trip between YAML and JSON formats, YAML version [1.2](https://yaml.org/spec/1.2/spec.html) is RECOMMENDED along with some additional constraints:

- Tags MUST be limited to those allowed by the [JSON Schema ruleset](https://yaml.org/spec/1.2/spec.html#id2803231).
- Keys used in YAML maps MUST be limited to a scalar string, as defined by the [YAML Failsafe schema ruleset](https://yaml.org/spec/1.2/spec.html#id2802346).

### Arazzo Description Structure

It is RECOMMENDED that the entry Arazzo document be named: `arazzo.json` or `arazzo.yaml`.

An Arazzo Description MAY be made up of a single document or be divided into multiple, connected parts at the discretion of the author. If workflows from other documents are being referenced, they MUST be included as a [Source Description Object](#source-description-object). In a multi-document description, the document containing the [Arazzo Specification Object](#arazzo-specification-object) is known as the **entry Arazzo document**.

### Data Types

Data types in the Arazzo Specification are based on the types supported by the [JSON Schema Specification Draft 2020-12](https://tools.ietf.org/html/draft-bhutton-json-schema-00#section-4.2.1). Note that integer as a type is also supported and is defined as a JSON number without a fraction or exponent part.

As defined by the [JSON Schema Validation vocabulary](https://tools.ietf.org/html/draft-bhutton-json-schema-validation-00#section-7), data types can have an optional modifier property: `format`. Arazzo additionally supports the formats (similar to the OpenAPI specification) to provide fine detail for primitive data types.

The formats defined are:

| `format`   | JSON Data Type | Comments                     |
|------------|----------------|------------------------------|
| `int32`    | number         | signed 32 bits               |
| `int64`    | number         | signed 64 bits (a.k.a long)  |
| `float`    | number         |                              |
| `double`   | number         |                              |
| `password` | string         | A hint to obscure the value. |

### Parsing Documents

Each document in an Arazzo Description MUST be fully parsed in order to locate possible reference targets before attempting to resolve references.
This includes the parsing requirements of [JSON Schema Specification Draft 2020-12](https://www.ietf.org/archive/id/draft-bhutton-json-schema-01.html#section-9), with appropriate modifications regarding base URIs as specified in [Relative References in Arazzo Description URIs](#relative-references-in-arazzo-description-uris).
Reference targets include the Arazzo Object's [`$self`](#arazzoSelf) field (when present) and Source Description `url` fields.

Implementations MUST NOT treat a reference as unresolvable before completely parsing all documents provided to the implementation as possible parts of the Arazzo Description.

#### Fragmentary Parsing

**Fragmentary parsing** occurs when an implementation parses only the specific part of a document being referenced, rather than parsing the complete document first. This practice is **strongly discouraged** and produces undefined behavior.

If only the referenced part of a document is parsed when resolving a reference, implementations may miss critical fields such as:

- The [`$self`](#arazzoSelf) field, causing identity-based references to fail
- Source Description `url` fields, preventing proper resolution of referenced API descriptions
- Other workflow or step definitions needed to validate cross-references

When fragmentary parsing causes references to resolve to unintended locations or fail to resolve entirely, the resulting behavior is _undefined_ and _implementation-defined_. Different implementations may handle such cases inconsistently, breaking interoperability.

Implementations MUST parse entire documents before resolving references to ensure consistent, predictable behavior across different tools and environments.

#### Identity-Based Referencing

To ensure interoperability, when referencing an Arazzo Description by URI, references MUST use the target document's [`$self`](#arazzoSelf) URI if the `$self` field is present in that document.

This means implementations MUST examine potential target Arazzo Descriptions (including those referenced via Source Description `url` fields or Workflow `workflowId` references) to check for matching `$self` values. When a Source Description Object's `url` field is an absolute URI, the implementation MUST resolve it to an Arazzo Description by identity (matching the `$self` value) rather than by location alone.

Implementations MAY support referencing by other identifiers (such as retrieval URIs), but this behavior is not interoperable and relying on it is NOT RECOMMENDED.

### Relative References in Arazzo Description URIs

URIs used as references within an Arazzo Description, including Source Description `url`, are resolved as _identifiers_, and described by this specification as **URIs**.

Unless specified otherwise, all fields that are URIs MAY be relative references as defined by [RFC3986 Section 4.2](https://tools.ietf.org/html/rfc3986#section-4.2).

#### Establishing the Base URI

Relative URI references are resolved using the appropriate base URI, which MUST be determined in accordance with [RFC3986 Section 5.1.1 – 5.1.4](https://tools.ietf.org/html/rfc3986#section-5.1.1).

The base URI for resolving relative references within an Arazzo Description is determined as follows:

- If the [`$self`](#arazzoSelf) field is present and is an absolute URI, the base URI is the `$self` URI (per [RFC3986 Section 5.1.1](https://tools.ietf.org/html/rfc3986#section-5.1.1): Base URI Embedded in Content).
- If the [`$self`](#arazzoSelf) field is present and is a relative URI-reference, it MUST first be resolved against the next possible base URI source per [RFC3986 Section 5.1.2 – 5.1.4](https://tools.ietf.org/html/rfc3986#section-5.1.2) before being used as the base URI for resolving other relative references.
- If the [`$self`](#arazzoSelf) field is not present, the base URI MUST be determined from the next possible base URI source per [RFC3986 Section 5.1.2 – 5.1.4](https://tools.ietf.org/html/rfc3986#section-5.1.2). The most common base URI source in this case is the retrieval URI of the Arazzo Description document (per [RFC3986 Section 5.1.3](https://tools.ietf.org/html/rfc3986#section-5.1.3)), though other sources such as encapsulating entities ([RFC3986 Section 5.1.2](https://tools.ietf.org/html/rfc3986#section-5.1.2)) or application-specific defaults ([RFC3986 Section 5.1.4](https://tools.ietf.org/html/rfc3986#section-5.1.4)) MAY apply.

For examples demonstrating base URI determination and reference resolution, see [Appendix B: Examples of Base URI Determination and Reference Resolution](#appendix-b-examples-of-base-uri-determination-and-reference-resolution).

#### Resolving URI Fragments

If a URI contains a fragment identifier, then the fragment MUST be resolved per the fragment resolution mechanism of the referenced document.

For JSON or YAML documents, the fragment identifier SHOULD be interpreted as a JSON Pointer as per [RFC6901](https://tools.ietf.org/html/rfc6901).

For JSON Schema objects used in workflow `inputs` and `components.inputs`, references via `$ref` MUST support both JSON Pointer fragments and plain-name fragments (defined by `$anchor`) as specified by [JSON Schema Specification Draft 2020-12](https://tools.ietf.org/html/draft-bhutton-json-schema-01.html).

When an Arazzo Description references an OpenAPI or AsyncAPI description via a Source Description `url` field, any fragments in runtime expressions (such as in `operationPath`) use JSON Pointer syntax to identify specific operations or components within that description. The resolution of further references within the referenced OpenAPI or AsyncAPI description (including Schema Object `$ref` and `$anchor` keywords) MUST follow the rules and guidance laid out by the OpenAPI Specification and AsyncAPI Specification respectively.

**Example:**

```yaml
sourceDescriptions:
  - name: petstore
    url: https://api.example.com/petstore.yaml
    type: openapi

workflows:
  - workflowId: example
    steps:
      - stepId: getPet
        # Fragment '#/paths/~1pets/get' resolves via JSON Pointer
        operationPath: '{$sourceDescriptions.petstore.url}#/paths/~1pets/get'
```

#### Relative URI References in CommonMark Fields

Relative references in CommonMark hyperlinks (such as those in `description` or `summary` fields) are resolved in their rendered context, which might differ from the context of the Arazzo Description.

### Relative References in API URLs

API endpoints accessed during workflow execution are described by this specification as **URLs** (locations, not identifiers).

When [Step Objects](#step-object) reference API operations via `operationId` or `operationPath`, the actual API endpoint URL is determined by the OpenAPI description's Server Object, not by the Arazzo Description's base URI.

Runtime expressions may reference API URLs via `$url` during workflow execution, but these are evaluated at execution time, not during document parsing.

### Schema

In the following description, if a field is not explicitly **REQUIRED** or described with a MUST or SHALL, it can be considered OPTIONAL.

#### Arazzo Specification Object

This is the root object of the [Arazzo Description](#arazzo-description).

##### Fixed Fields

| Field Name                                     |                           Type                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|------------------------------------------------|:---------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="arazzoVersion"></a>arazzo             |                         `string`                          | **REQUIRED**. This string MUST be the [version number](#versions) of the Arazzo Specification that the Arazzo Description uses. The `arazzo` field MUST be used by tooling to interpret the Arazzo Description.                                                                                                                                                                                                                                                                                                                                                                                                                         |
| <a name="arazzoSelf"></a>$self                 |                         `string`                          | A URI-reference for the Arazzo Description. This string MUST be in the form of a URI-reference as defined by [RFC3986 Section 4.1](https://tools.ietf.org/html/rfc3986#section-4.1). When present, this field provides the self-assigned URI of this Arazzo Description, which also serves as its base URI in accordance with [RFC3986 Section 5.1.1](https://tools.ietf.org/html/rfc3986#section-5.1.1) for resolving relative references within this document. The `$self` URI MUST NOT contain a fragment identifier. Arazzo Description documents can include a `$self` field to ensure portable, unambiguous reference resolution. |
| <a name="arazzoInfo"></a>info                  |                [Info Object](#info-object)                | **REQUIRED**. Provides metadata about the workflows contain within the Arazzo Description. The metadata MAY be used by tooling as required.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| <a name="arazzoSources"></a>sourceDescriptions | [[Source Description Object](#source-description-object)] | **REQUIRED**. A list of source descriptions (such as an OpenAPI description) this Arazzo Description SHALL apply to. The list MUST have at least one entry.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| <a name="workflows"></a>workflows              |           [[Workflow Object](#workflow-object)]           | **REQUIRED**. A list of workflows. The list MUST have at least one entry.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| <a name="components"></a>components            |          [Components Object](#components-object)          | An element to hold various schemas for the Arazzo Description.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Arazzo Specification Object Example

```yaml
arazzo: 1.1.0
$self: https://api.example.com/workflows/pet-purchase.arazzo.yaml
info:
  title: A pet purchasing workflow
  summary: This Arazzo Description showcases the workflow for how to purchase a pet through a sequence of API calls
  description: |
      This Arazzo Description walks you through the workflow and steps of `searching` for, `selecting`, and `purchasing` an available pet.
  version: 1.0.1
sourceDescriptions:
- name: petStoreDescription
  url: https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml
  type: openapi
- name: asyncOrderApiDescription
  url: https://raw.githubusercontent.com/OAI/Arazzo-Specification/main/examples/1.1.0/pet-asyncapi.yaml
  type: asyncapi

workflows:
- workflowId: loginUserAndRetrievePet
  summary: Login User and then retrieve pets
  description: This workflow lays out the steps to login a user and then retrieve pets
  inputs:
      type: object
      properties:
          username:
              type: string
          password:
              type: string
          orderCorrelationId:
              type: string
  steps:
  - stepId: loginStep
    description: This step demonstrates the user login step
    operationId: $sourceDescriptions.petstoreDescription.loginUser
    parameters:
      # parameters to inject into the loginUser operation (parameter name must be resolvable at the referenced operation and the value is determined using {expression} syntax)
      - name: username
        in: query
        value: $inputs.username
      - name: password
        in: query
        value: $inputs.password
    successCriteria:
      # assertions to determine step was successful
      - condition: $statusCode == 200
    outputs:
      # outputs from this step
      tokenExpires: $response.header.X-Expires-After
      rateLimit: $response.header.X-Rate-Limit
      sessionToken: $response.body
  - stepId: getPetStep
    description: retrieve a pet by status from the GET pets endpoint
    operationPath: '{$sourceDescriptions.petstoreDescription.url}#/paths/~1pet~1findByStatus/get'
    parameters:
      - name: status
        in: query
        value: 'available'
      - name: Authorization
        in: header
        value: $steps.loginStep.outputs.sessionToken
    successCriteria:
      - condition: $statusCode == 200
    onSuccess:
      - name: 'noPetsAvailable'
        type: "end"
        criteria:
          - condition: $response.body#/0 == null
    outputs:
      petId: $response.body#/0/id
  - stepId: purchasePetStep
    description: purchase a pet by posting an message on place-order channel
    operationPath: $sourceDescriptions.asyncOrderApiDescription.placeOrder
    action: send
    parameters:
    - name: orderCorrelationId
      in: header
      value: $inputs.orderCorrelationId
    requestBody:
      contentType: application/json
      payload:
        petId: $steps.getPetStep.outputs.petId
  - stepId: confirmPetPurchaseStep
    description: confirm the purchase of a pet
    operationPath: $sourceDescriptions.asyncOrderApiDescription.confirmOrder
    correlationId: $inputs.orderCorrelationId
    timeout: 6000
    action: receive
    outputs:
      orderId: $message.payload.orderId
  outputs:
      orderId: $steps.confirmPetPurchaseStep.outputs.orderId
```

#### Info Object

The object provides metadata about API workflows defined in this Arazzo document.
The metadata MAY be used by the clients if needed.

##### Fixed Fields

| Field Name                                |   Type   | Description                                                                                                                                        |
|-------------------------------------------|:--------:|----------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="infoTitle"></a>title             | `string` | **REQUIRED**. A human readable title of the Arazzo Description.                                                                                    |
| <a name="infoSummary"></a>summary         | `string` | A short summary of the Arazzo Description.                                                                                                         |
| <a name="infoDescription"></a>description | `string` | A description of the purpose of the workflows defined. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation. |
| <a name="infoVersion"></a>version         | `string` | **REQUIRED**. The version identifier of the Arazzo document (which is distinct from the [Arazzo Specification version](#versions)).                |


This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Info Object Example

```yaml
title: A pet purchasing workflow
summary: This workflow showcases how to purchase a pet through a sequence of API calls
description: |
    This workflow walks you through the steps of searching for, selecting, and purchasing an available pet.
version: 1.0.1
```

#### Source Description Object

Describes a source description (such as an OpenAPI description) that will be referenced by one or more workflows described within an Arazzo Description.

An object storing a map between named description keys and location URLs to the source descriptions (such as an OpenAPI description) this Arazzo Description SHALL apply to. Each source location `string` MUST be in the form of a URI-reference as defined by [RFC3986](https://tools.ietf.org/html/rfc3986#section-4.1).

##### Fixed Fields

| Field Name                    |   Type   | Description                                                                                                                                                                                                                                                                         |
|-------------------------------|:--------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="sourceName"></a>name | `string` | **REQUIRED**. A unique name for the source description. Tools and libraries MAY use the `name` to uniquely identify a source description, therefore, it is RECOMMENDED to follow common programming naming conventions. SHOULD conform to the regular expression `[A-Za-z0-9_\-]+`. |
| <a name="sourceURL"></a>url   | `string` | **REQUIRED**. A URL to a source description to be used by a workflow. If a relative reference is used, it MUST be in the form of a URI-reference as defined by [RFC3986](https://tools.ietf.org/html/rfc3986#section-4.2).                                                          |
| <a name="sourceType"></a>type | `string` | The type of source description. Possible values are `"openapi"` or `"asyncapi"` or `"arazzo"`.                                                                                                                                                                                      |


This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Source Description Object Example

```yaml
name: petStoreDescription
url: https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml
type: openapi
```

#### Workflow Object

Describes the steps to be taken across one or more APIs to achieve an objective. The workflow object MAY define inputs needed in order to execute workflow steps, where the defined steps represent a call to an API operation or another workflow, and a set of outputs.

##### Fixed Fields

| Field Name                                          |                                           Type                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|-----------------------------------------------------|:----------------------------------------------------------------------------------------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="workflowId"></a>workflowId                 |                                         `string`                                         | **REQUIRED**. Unique string to represent the workflow. The id MUST be unique amongst all workflows described in the Arazzo Description. The `workflowId` value is **case-sensitive**. Tools and libraries MAY use the `workflowId` to uniquely identify a workflow, therefore, it is RECOMMENDED to follow common programming naming conventions. SHOULD conform to the regular expression `[A-Za-z0-9_\-]+`.                                                                                                                                                                        |
| <a name="workflowSummary"></a>summary               |                                         `string`                                         | A summary of the purpose or objective of the workflow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| <a name="workflowDescription"></a>description       |                                         `string`                                         | A description of the workflow. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <a name="workflowInputs"></a>inputs                 |                                      `JSON Schema`                                       | A JSON Schema 2020-12 object representing the input parameters used by this workflow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <a name="dependsOn"></a>dependsOn                   |                                        [`string`]                                        | A list of workflows that MUST be completed before this workflow can be processed. Each value provided MUST be a `workflowId`. If the workflow depended on is defined within the current Workflow Document, then specify the `workflowId` of the relevant local workflow. If the workflow is defined in a separate Arazzo Document then the workflow MUST be defined in the `sourceDescriptions` and the `workflowId` MUST be specified using a [Runtime Expression](#runtime-expressions) (e.g., `$sourceDescriptions.<name>.<workflowId>`) to avoid ambiguity or potential clashes. |
| <a name="workflowSteps"></a>steps                   |                              [[Step Object](#step-object)]                               | **REQUIRED**. An ordered list of steps where each step represents a call to an API operation or to another workflow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| <a name="workflowSuccessActions"></a>successActions | [[Success Action Object](#success-action-object) \| [Reusable Object](#reusable-object)] | A list of success actions that are applicable for all steps described under this workflow. These success actions can be overridden at the step level but cannot be removed there. If a Reusable Object is provided, it MUST link to success actions defined in the [components/successActions](#components-object) of the current Arazzo document. The list MUST NOT include duplicate success actions.                                                                                                                                                                              |
| <a name="workflowFailureActions"></a>failureActions | [[Failure Action Object](#failure-action-object) \| [Reusable Object](#reusable-object)] | A list of failure actions that are applicable for all steps described under this workflow. These failure actions can be overridden at the step level but cannot be removed there. If a Reusable Object is provided, it MUST link to failure actions defined in the [components/failureActions](#components-object) of the current Arazzo document. The list MUST NOT include duplicate failure actions.                                                                                                                                                                              |
| <a name="workflowOutputs"></a>outputs               |           Map[`string`, {expression} \| [Selector Object](#selector-object) ]            | A map between a friendly name and a dynamic output value defined using a [Runtime Expression](#runtime-expressions) or [Selector Object](#selector-object). The name MUST use keys that match the regular expression: `^[a-zA-Z0-9\.\-_]+$`.                                                                                                                                                                                                                                                                                                                                         |
| <a name="workflowParameters"></a>parameters         |      [[Parameter Object](#parameter-object) \| [Reusable Object](#reusable-object)]      | A list of parameters that are applicable for all steps described under this workflow. These parameters can be overridden at the step level but cannot be removed there. Each parameter MUST be passed to an operation or workflow as referenced by `operationId`, `operationPath`, or `workflowId` as specified within each step. If a Reusable Object is provided, it MUST link to a parameter defined in the [components/parameters](#components-object) of the current Arazzo document. The list MUST NOT include duplicate parameters.                                           |


This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Workflow Object Example

```yaml
workflowId: loginUser
summary: Login User
description: This workflow lays out the steps to login a user
inputs:
    type: object
    properties:
        username:
            type: string
        password:
            type: string
steps:
  - stepId: loginStep
    description: This step demonstrates the user login step
    operationId: loginUser
    parameters:
      # parameters to inject into the loginUser operation (parameter name must be resolvable at the referenced operation and the value is determined using {expression} syntax)
      - name: username
        in: query
        value: $inputs.username
      - name: password
        in: query
        value: $inputs.password
    successCriteria:
        # assertions to determine step was successful 
        - condition: $statusCode == 200
    outputs:
        # outputs from this step
        tokenExpires: $response.header.X-Expires-After
        rateLimit: $response.header.X-Rate-Limit
outputs:
    tokenExpires: $steps.loginStep.outputs.tokenExpires
```

#### Step Object

Describes a single workflow step which MAY be a call to an API operation ([OpenAPI Operation Object](https://spec.openapis.org/oas/latest.html#operation-object)), ([AysncAPI Operations Object](https://www.asyncapi.com/docs/reference/specification/latest#operationsObject)) or another [Workflow Object](#workflow-object).

##### Fixed Fields

| Field Name                                        |                                           Type                                           | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
|---------------------------------------------------|:----------------------------------------------------------------------------------------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="stepDescription"></a>description         |                                         `string`                                         | A description of the step. [CommonMark syntax](https://spec.commonmark.org/) MAY be used for rich text representation.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| <a name="stepId"></a>stepId                       |                                         `string`                                         | **REQUIRED**. Unique string to represent the step. The `stepId` MUST be unique amongst all steps described in the workflow. The `stepId` value is **case-sensitive**. Tools and libraries MAY use the `stepId` to uniquely identify a workflow step, therefore, it is RECOMMENDED to follow common programming naming conventions. SHOULD conform to the regular expression `[A-Za-z0-9_\-]+`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| <a name="stepOperationId"></a>operationId         |                                         `string`                                         | The name of an existing, resolvable operation, as defined with a unique `operationId` and existing within one of the `sourceDescriptions`. The referenced operation will be invoked by this workflow step. If multiple (non `arazzo` type) `sourceDescriptions` are defined, then the `operationId` MUST be specified using a [Runtime Expression](#runtime-expressions) (e.g., `$sourceDescriptions.<name>.<operationId>`) to avoid ambiguity or potential clashes. This field is mutually exclusive of the `operationPath` and `workflowId` fields respectively.                                                                                                                                                                                                                                                                                                                                                                                       |
| <a name="stepOperationPath"></a>operationPath     |                                         `string`                                         | A reference to a [Source Description Object](#source-description-object) combined with a [JSON Pointer](https://tools.ietf.org/html/rfc6901) to reference an operation. This field is mutually exclusive of the `operationId` and `workflowId` fields respectively. The operation being referenced MUST be described within one of the `sourceDescriptions` descriptions. A [Runtime Expression](#runtime-expressions) syntax MUST be used to identify the source description document. If the referenced operation has an `operationId` defined then the `operationId` SHOULD be preferred over the `operationPath`.                                                                                                                                                                                                                                                                                                                                    |
| <a name="stepChannelPath"></a>channelPath         |                                         `string`                                         | A reference to a [Source Description Object](#source-description-object) combined with a [JSON Pointer](https://tools.ietf.org/html/rfc6901) to reference an event channel. This field is mutually exclusive of the `operationId` and `workflowId` fields respectively. The operation being referenced MUST be described within one of the `sourceDescriptions` descriptions. A [Runtime Expression](#runtime-expressions) syntax MUST be used to identify the source description document. If the referenced operation has an `operationId` defined then the `operationId` SHOULD be preferred over the `channelPath`.                                                                                                                                                                                                                                                                                                                                  |
| <a name="stepWorkflowId"></a>workflowId           |                                         `string`                                         | The [workflowId](#fixed-fields-2) referencing an existing workflow within the Arazzo Description. If the referenced workflow is contained within an `arazzo` type `sourceDescription`, then the `workflowId` MUST be specified using a [Runtime Expression](#runtime-expressions) (e.g., `$sourceDescriptions.<name>.<workflowId>`) to avoid ambiguity or potential clashes. The field is mutually exclusive of the `operationId` and `operationPath` fields respectively.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| <a name="stepParameters"></a>parameters           |      [[Parameter Object](#parameter-object) \| [Reusable Object](#reusable-object)]      | A list of parameters that MUST be passed to an operation or workflow as referenced by `operationId`, `operationPath`, or `workflowId`. If a parameter is already defined at the [Workflow](#workflow-object), the new definition will override it but can never remove it. If a Reusable Object is provided, it MUST link to a parameter defined in the [components/parameters](#components-object) of the current Arazzo document. The list MUST NOT include duplicate parameters.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| <a name="stepRequestBody"></a>requestBody         |                       [Request Body Object](#request-body-object)                        | The request body to pass to an operation as referenced by `operationId` or `operationPath`. The `requestBody` is fully supported in HTTP methods where the HTTP 1.1 specification [RFC9110](https://tools.ietf.org/html/rfc9110#section-9.3) explicitly defines semantics for "content" like request bodies, such as within POST, PUT, and PATCH methods. For methods where the HTTP specification provides less clarity—such as GET, HEAD, and DELETE—the use of `requestBody` is permitted but does not have well-defined semantics. In these cases, its use SHOULD be avoided if possible.                                                                                                                                                                                                                                                                                                                                                            |
| <a name="stepSuccessCriteria"></a>successCriteria |                         [[Criterion Object](#criterion-object)]                          | A list of assertions to determine the success of the step. Each assertion is described using a [Criterion Object](#criterion-object). All assertions `MUST` be satisfied for the step to be deemed successful. `MUST` contain at least one [Criterion Object](#criterion-object)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| <a name="stepOnSuccess"></a>onSuccess             | [[Success Action Object](#success-action-object) \| [Reusable Object](#reusable-object)] | An array of success action objects that specify what to do upon step success. If omitted, the next sequential step shall be executed as the default behavior. If multiple success actions have similar `criteria`, the first sequential action matching the criteria SHALL be the action executed. If a success action is already defined at the [Workflow](#workflow-object), the new definition will override it but can never remove it. If a Reusable Object is provided, it MUST link to a success action defined in the [components](#components-object) of the current Arazzo document. The list MUST NOT include duplicate success actions.                                                                                                                                                                                                                                                                                                      |
| <a name="stepOnFailure"></a>onFailure             | [[Failure Action Object](#failure-action-object) \| [Reusable Object](#reusable-object)] | An array of failure action objects that specify what to do upon step failure. If omitted, the default behavior is to break and return. If multiple failure actions have similar `criteria`, the first sequential action matching the criteria SHALL be the action executed. If a failure action is already defined at the [Workflow](#workflow-object), the new definition will override it but can never remove it. If a Reusable Object is provided, it MUST link to a failure action defined in the [components](#components-object) of the current Arazzo document. The list MUST NOT include duplicate failure actions.                                                                                                                                                                                                                                                                                                                             |
| <a name="stepOutputs"></a>outputs                 |            Map[`string`, {expression} \| [Selector Object](#selector-object)]            | A map between a friendly name and a dynamic output value defined using a [Runtime Expression](#runtime-expressions) or [Selector Object](#selector-object). The name MUST use keys that match the regular expression: `^[a-zA-Z0-9\.\-_]+$`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| <a name="stepTimeout"></a>timeout                 |                                        `integer`                                         | The maximum number of milli-seconds to wait for the step to complete before aborting and failing the step. Consequently this will fail the workflow unless failureActions are defined.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| <a name="stepCorrelationId"></a>correlationId     |                                         `string`                                         | A correlationId in AsyncAPI links a request with its response (or more broadly, to trace a single logical transaction across multiple asynchronous messages). Only applicable to `asyncapi` steps with action `receive` and has to be in-sync with correlationId defined in the AsyncAPI document.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <a name="stepAction"></a>action                   |                                    `send or receive`                                     | Describes the intent of the message flow. Indicates whether the step will send (publish) or receive (subscribe) to a message on a channel described in an AsyncAPI document, Only applicable for `asyncapi` steps.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| <a name="stepDependsOn"></a>dependsOn             |                                      List[`string`]                                      | A list of steps that MUST be completed before this step can be executed. `dependsOn` only establishes a prerequisite relationship for the current step and does not trigger execution of the referenced steps. Each value provided MUST be a `stepId`. The `stepId` value is case-sensitive. If the step depended on is defined within the **current workflow**, specify the `stepId` directly (e.g., `authStep`). If the step is defined in a **different workflow within the current Arazzo Document**, reference it using `$workflows.<workflowId>.steps.<stepId>`. If the step is defined in a **separate Arazzo Document**, the workflow MUST be defined in `sourceDescriptions` and referenced using `$sourceDescriptions.<name>.<workflowId>.steps.<stepId>` to avoid ambiguity. If your step depends on the output of a non-blocking/asynchronous step, then you SHOULD use `dependsOn` and refer to the async step using one of these patterns. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Step Object Examples

A single step example:

```yaml
stepId: loginStep
description: This step demonstrates the user login step
operationId: loginUser
parameters:
    # parameters to inject into the loginUser operation (parameter name must be resolvable at the referenced operation and the value is determined using {expression} syntax)
    - name: username
      in: query
      value: $inputs.username
    - name: password
      in: query
      value: $inputs.password
successCriteria:
    # assertions to determine step was successful
    - condition: $statusCode == 200
outputs:
    # outputs from this step
    tokenExpires: $response.header.X-Expires-After
    rateLimit: $response.header.X-Rate-Limit
```

A multiple step example:

```yaml
steps:
  - stepId: loginStep
    description: This step demonstrates the user login step
    operationId: loginUser
    parameters:
        # parameters to inject into the loginUser operation (parameter name must be resolvable at the referenced operation and the value is determined using {expression} syntax)
      - name: username
        in: query
        value: $inputs.username
      - name: password
        in: query
        value: $inputs.password
    successCriteria:
        # assertions to determine step was successful
      - condition: $statusCode == 200
    outputs:
        # outputs from this step
        tokenExpires: $response.header.X-Expires-After
        rateLimit: $response.header.X-Rate-Limit
        sessionToken: $response.body
  - stepId: getPetStep
    description: retrieve a pet by status from the GET pets endpoint
    operationPath: '{$sourceDescriptions.petStoreDescription.url}#/paths/~1pet~1findByStatus/get'
    parameters:
      - name: status
        in: query
        value: 'available'
      - name: Authorization
        in: header
        value: $steps.loginStep.outputs.sessionToken
    successCriteria:
      - condition: $statusCode == 200
    outputs:
        # outputs from this step
        availablePets: $response.body
```

An async step example:

```yaml
- stepId: placeOrder
  description: This step demonstrates the action of sending a message payload to place an order
  operationId: $sourceDescriptions.asyncOrderApi.placeOrder
  action: send
  parameters:
      - name: requestId
        in: header
        value: $inputs.correlationId
  requestBody:
      payload:
          productId: $inputs.productDetails.productId
          quantity: $inputs.productDetails.quantity
- stepId: confirmOrder
  description: This step demonstrates the action of receiving a message payload to confirm an order
  operationId: $sourceDescriptions.asyncOrderApi.confirmOrder
  correlationId: $inputs.correlationId
  action: receive
  dependsOn:
    - placeOrder
  timeout: 6000
  outputs:
      orderId: $message.payload.orderId
```

#### Parameter Object

Describes a single step parameter. A unique parameter is defined by the combination of a `name` and `in` fields. There are several possible locations specified by the `in` field:

- path - Used together with OpenAPI style [Path Templating](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#path-templating), where the parameter value is actually part of the operation's URL. This does not include the host or base path of the API. For example, in `/items/{itemId}`, the path parameter is `itemId`.
- query - Parameters that are appended to the URL as individual key-value pairs. For example, in `/items?id=###`, the query parameter is `id`.
- querystring - A parameter that treats the entire URL query string as a single value. This parameter location was introduced in [OpenAPI 3.2.0](https://spec.openapis.org/oas/v3.2.0.html) to support scenarios where the complete query string must be passed as a pre-formatted string rather than individual parameters. When a step references an operation that defines a querystring parameter, the value MUST match the media type format as expressed by the parameter's `content` field (e.g., `application/x-www-form-urlencoded`). The `querystring` location cannot coexist with `query` parameters in the same operation per OpenAPI constraints.
- header - Custom headers that are expected as part of the request. Note that [RFC9110](https://tools.ietf.org/html/rfc9110#name-field-names) states field names (which includes header) are case-insensitive.
- cookie - Used to pass a specific cookie value to the source API.

##### Fixed Fields

| Field Name                          |                            Type                            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|-------------------------------------|:----------------------------------------------------------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="parameterName"></a> name   |                          `string`                          | **REQUIRED**. The name of the parameter. Parameter names are _case sensitive_.                                                                                                                                                                                                                                                                                                                                                                                          |
| <a name="parameterIn"></a> in       |                          `string`                          | The location of the parameter. Possible values are `"path"`, `"query"`, `"querystring"`, `"header"`, or `"cookie"`. When the step, success action, or failure action in context specifies a `workflowId`, then all parameters map to workflow inputs. In all other scenarios (e.g., a step specifies an `operationId`), the `in` field MUST be specified.                                                                                                               |
| <a name="parameterValue"></a> value | Any \| {expression} \| [Selector Object](#selector-object) | **REQUIRED**. The value to pass in the parameter. The value can be a constant, a [Runtime Expression](#runtime-expressions), or a [Selector Object](#selector-object) to be evaluated and passed to the referenced operation or workflow. For `querystring` parameters, the value MUST resolve to a string representing the complete query string (e.g., `"key1=value1&key2=value2"`). Runtime expressions can be embedded within the string value using `{}` notation. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Parameter Object Examples

```yaml
# Query Example
- name: username
  in: query
  value: $inputs.username

# Querystring Example (application/x-www-form-urlencoded)
- name: searchParams
  in: querystring
  value: "filter=active&sort=desc&limit=50"

# Querystring with Runtime Expressions (application/x-www-form-urlencoded)
- name: fullQuery
  in: querystring
  value: "category={$inputs.category}&minPrice={$inputs.minPrice}&inStock=true"

# Querystring Example (application/json)
- name: filterParams
  in: querystring
  value: '{"filter":"active","sort":"desc","limit":50}'
  
# Header Example
- name: X-Api-Key
  in: header
  value: $inputs.x-api-key
```

#### Success Action Object

A single success action which describes an action to take upon success of a workflow step. There are two possible values for the `type` field:

- end - The workflow ends, and context returns to the caller with applicable outputs
- goto - A one-way transfer of workflow control to the specified label (either a `workflowId` or `stepId`)

##### Fixed Fields

| Field Name                                  |                                      Type                                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------------------|:------------------------------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="successActionName"></a> name       |                                    `string`                                    | **REQUIRED**. The name of the success action. Names are _case sensitive_.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| <a name="successActionType"></a> type       |                                    `string`                                    | **REQUIRED**. The type of action to take. Possible values are `"end"` or `"goto"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| <a name="successWorkflowId"></a> workflowId |                                    `string`                                    | The [workflowId](#fixed-fields-2) referencing an existing workflow within the Arazzo Description to transfer to upon success of the step. This field is only relevant when the `type` field value is `"goto"`. If the referenced workflow is contained within an `arazzo` type `sourceDescription`, then the `workflowId` MUST be specified using a [Runtime Expression](#runtime-expressions) (e.g., `$sourceDescriptions.<name>.<workflowId>`) to avoid ambiguity or potential clashes. This field is mutually exclusive to `stepId`. |
| <a name="successStepId"></a> stepId         |                                    `string`                                    | The `stepId` to transfer to upon success of the step. This field is only relevant when the `type` field value is `"goto"`. The referenced `stepId` MUST be within the current workflow. This field is mutually exclusive to `workflowId`.                                                                                                                                                                                                                                                                                               |
| <a name="successParameters"></a>parameters  | [[Parameter Object](#parameter-object) \| [Reusable Object](#reusable-object)] | A list of parameters that MUST be passed to a workflow as referenced by `workflowId`. If a Reusable Object is provided, it MUST link to a parameter defined in the [components/parameters](#components-object) of the current Arazzo document. The list MUST NOT include duplicate parameters. The `in` field MUST NOT be used.                                                                                                                                                                                                         |
| <a name="successCriteria"></a> criteria     |                    [[Criterion Object](#criterion-object)]                     | A list of assertions to determine if this action SHALL be executed. Each assertion is described using a [Criterion Object](#criterion-object). All criteria assertions `MUST` be satisfied for the action to be executed.                                                                                                                                                                                                                                                                                                               |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Success Action Object Example

```yaml
name: JoinWaitingList
type: goto
stepId: joinWaitingListStep
criteria:
    # assertions to determine if this success action should be executed
    - context: $response.body
      condition: $[?count(@.pets) > 0]
      type: jsonpath
```

#### Failure Action Object

A single failure action which describes an action to take upon failure of a workflow step. There are three possible values for the `type` field:

- end - The workflow ends, and context returns to the caller with applicable outputs
- retry - The current step will be retried. The retry will be constrained by the `retryAfter` and `retryLimit` fields. If a `stepId` or `workflowId` are specified, then the reference is executed and the context is returned, after which the current step is retried.
- goto - A one-way transfer of workflow control to the specified label (either a `workflowId` or `stepId`)

##### Fixed Fields

| Field Name                                  |                                      Type                                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|---------------------------------------------|:------------------------------------------------------------------------------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="failureActionName"></a> name       |                                    `string`                                    | **REQUIRED**. The name of the failure action. Names are _case sensitive_.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| <a name="failureActionType"></a> type       |                                    `string`                                    | **REQUIRED**. The type of action to take. Possible values are `"end"`, `"retry"`, or `"goto"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| <a name="failureWorkflowId"></a> workflowId |                                    `string`                                    | The [workflowId](#fixed-fields-2) referencing an existing workflow within the Arazzo Description to transfer to upon failure of the step. This field is only relevant when the `type` field value is `"goto"` or `"retry"`. If the referenced workflow is contained within an `arazzo` type `sourceDescription`, then the `workflowId` MUST be specified using a [Runtime Expression](#runtime-expressions) (e.g., `$sourceDescriptions.<name>.<workflowId>`) to avoid ambiguity or potential clashes. This field is mutually exclusive to `stepId`. When used with `"retry"`, context transfers back upon completion of the specified workflow. |
| <a name="failureStepId"></a> stepId         |                                    `string`                                    | The `stepId` to transfer to upon failure of the step. This field is only relevant when the `type` field value is `"goto"` or `"retry"`. The referenced `stepId` MUST be within the current workflow. This field is mutually exclusive to `workflowId`. When used with `"retry"`, context transfers back upon completion of the specified step.                                                                                                                                                                                                                                                                                                   |
| <a name="failureParameters"></a>parameters  | [[Parameter Object](#parameter-object) \| [Reusable Object](#reusable-object)] | A list of parameters that MUST be passed to a workflow as referenced by `workflowId`. If a Reusable Object is provided, it MUST link to a parameter defined in the [components/parameters](#components-object) of the current Arazzo document. The list MUST NOT include duplicate parameters. The `in` field MUST NOT be used.                                                                                                                                                                                                                                                                                                                  |
| <a name="failureRetryAfter"></a> retryAfter |                                    `number`                                    | A non-negative decimal indicating the seconds to delay after the step failure before another attempt SHALL be made. **Note:** if an HTTP [Retry-After](https://tools.ietf.org/html/rfc9110.html#name-retry-after) response header was returned to a step from a targeted operation, then it SHOULD overrule this particular field value. This field only applies when the `type` field value is `"retry"`.                                                                                                                                                                                                                                       |
| <a name="failureRetryLimit"></a> retryLimit |                                   `integer`                                    | A non-negative integer indicating how many attempts to retry the step MAY be attempted before failing the overall step. If not specified then a single retry SHALL be attempted. This field only applies when the `type` field value is `"retry"`. The `retryLimit` MUST be exhausted prior to executing subsequent failure actions.                                                                                                                                                                                                                                                                                                             |
| <a name="failureCriteria"></a> criteria     |                    [[Criterion Object](#criterion-object)]                     | A list of assertions to determine if this action SHALL be executed. Each assertion is described using a [Criterion Object](#criterion-object).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Failure Action Object Example

```yaml
name: retryStep
type: retry
retryAfter: 1
retryLimit: 5
criteria:
    # assertions to determine if this action should be executed
    - condition: $statusCode == 503
```

#### Components Object

Holds a set of reusable objects for different aspects of the Arazzo Specification. All objects defined within the components object will have no effect on the Arazzo Description unless they are explicitly referenced from properties outside the components object.

Components are scoped to the Arazzo document they are defined in. For example, if a step defined in Arazzo document "A" references a workflow defined in Arazzo document "B", the components in "A" are not considered when evaluating the workflow referenced in "B".

##### Fixed Fields

| Field Name                                           | Type                                                           | Description                                                                           |
|------------------------------------------------------|:---------------------------------------------------------------|---------------------------------------------------------------------------------------|
| <a name="componentInputs"></a> inputs                | Map[`string`, `JSON Schema`]                                   | An object to hold reusable JSON Schema objects to be referenced from workflow inputs. |
| <a name="componentParameters"></a>parameters         | Map[`string`, [Parameter Object](#parameter-object)]           | An object to hold reusable Parameter Objects                                          |
| <a name="componentSuccessActions"></a>successActions | Map[`string`, [Success Action Object](#success-action-object)] | An object to hold reusable Success Actions Objects.                                   |
| <a name="componentFailureActions"></a>failureActions | Map[`string`, [Failure Action Object](#failure-action-object)] | An object to hold reusable Failure Actions Objects.                                   |

This object MAY be extended with [Specification Extensions](#specification-extensions).


All the fixed fields declared above are objects that MUST use keys that match the regular expression: `^[a-zA-Z0-9\.\-_]+$`. The key is used to refer to the input or parameter in other parts of the Workflow Description.

Field Name Examples:

```text
User
User_1
User_Name
user-name
my.org.User
```

##### Components Object Example

```yaml
components:
  parameters:
    storeId:
      name: storeId
      in: header
      value: $inputs.x-store-id
  inputs:
    pagination:
      type: object
      properties:
        page:
          type: integer
          format: int32
        pageSize:
          type: integer
          format: int32
  failureActions:
    refreshToken:
      name: refreshExpiredToken
      type: retry
      retryAfter: 1
      retryLimit: 5
      workflowId: refreshTokenWorkflowId
      criteria:
          # assertions to determine if this action should be executed
          - condition: $statusCode == 401       
```

```json
"components": {
  "parameters": {
    "storeId": {
      "name": "storeId",
      "in": "header",
      "value": "$inputs.x-store-id"
    }
  },
  "inputs": {
    "pagination": {
      "type": "object",
      "properties": {
        "page": {
          "type": "integer",
          "format": "int32"
        },
        "pageSize": {
          "type": "integer",
          "format": "int32"
        }
      }
    }
  },
  "failureActions": {
    "refreshToken": {
      "name": "refreshExpiredToken",
      "type": "retry",
      "retryAfter": 1,
      "retryLimit": 5,
      "workflowId": "refreshTokenWorkflowId",
      "criteria": [
        {
          "condition": "$statusCode == 401"
        }
      ]
    }
  }
}
```

#### Reusable Object

A simple object to allow referencing of objects contained within the [Components Object](#components-object). It can be used from locations within steps or workflows in the Arazzo Description. **Note** - Input Objects MUST use standard JSON Schema referencing via the `$ref` keyword while all non JSON Schema objects use this object and its expression based referencing mechanism.


##### Fixed Fields

| Field Name                                      |      Type      | Description                                                                                        |
|-------------------------------------------------|:--------------:|----------------------------------------------------------------------------------------------------|
| <a name="reusableObjectReference"></a>reference | `{expression}` | **REQUIRED**. A [Runtime Expression](#runtime-expressions) used to reference the desired object.   |
| <a name="reusableObjectValue"></a>value         |    `string`    | Sets a value of the referenced parameter. This is only applicable for parameter object references. |

This object cannot be extended with additional properties and any properties added MUST be ignored.

##### Reusable Object Example

```yaml
  reference: $components.successActions.notify
```

```json
  {
    "reference": "$components.successActions.notify"
  }
```

```yaml
  reference: $components.parameters.page
  value: 1
```

```json
  {
    "reference": "$components.parameters.page",
    "value": 1
  }
```

#### Criterion Object

An object used to specify the context, conditions, and condition types that can be used to prove or satisfy assertions specified in [Step Object](#step-object) `successCriteria`, [Success Action Object](#success-action-object) `criteria`, and [Failure Action Object](#failure-action-object) `criteria`.

There are four flavors of conditions supported:

- simple - where basic literals, operators, and loose comparisons are used in combination with [Runtime Expressions](#runtime-expressions).
- regex - where a regex pattern is applied on the supplied context. The context is defined by a [Runtime Expression](#runtime-expressions).
- jsonpath - where a JSONPath expression is applied. The root node context is defined by a [Runtime Expression](#runtime-expressions).
- xpath - where an XPath expression is applied. The root node context is defined by a [Runtime Expression](#runtime-expressions).

##### Literals

As part of a condition expression, you can use `boolean`, `null`, `number`, or `string` data types.

| Type      | Literal value                                                                                                                                               |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `boolean` | `true` or `false`                                                                                                                                           |
| `null`    | `null`                                                                                                                                                      |
| `number`  | Any number format supported in [Data Types](#data-types).                                                                                                   |
| `string`  | Strings MUST use single quotes (') around the string. To use a literal single quote, escape the literal single quote using an additional single quote (''). |

##### Operators

| Operator          | Description           |
|-------------------|-----------------------|
| `<`               | Less than             |
| `<=`              | Less than or equal    |
| `>`               | Greater than          |
| `>=`              | Greater than or equal |
| `==`              | Equal                 |
| `!=`              | Not equal             |
| `!`               | Not                   |
| `&&`              | And                   |
| <code>\|\|</code> | Or                    |
| `()`              | Logical Grouping      |
| `[]`              | Index (0-based)       |
| `.`               | Property de-reference |

String comparisons `MUST` be case insensitive.

##### Fixed Fields

| Field Name                                 |                             Type                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|--------------------------------------------|:-------------------------------------------------------------:|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="criterionContext"></a>context     |                        `{expression}`                         | A [Runtime Expression](#runtime-expressions) used to set the context for the condition to be applied on. If `type` is specified, then the `context` MUST be provided (e.g. `$response.body` would set the context that a JSONPath query expression could be applied to).                                                                                                                                                                                                                                                                                                                                                        |
| <a name="criterionCondition"></a>condition |                           `string`                            | **REQUIRED**. The condition to apply. Conditions can be simple (e.g. `$statusCode == 200` which applies an operator on a value obtained from a runtime expression), or a regex, or a JSONPath expression. For regex or JSONPath, the `type` and `context` MUST be specified.                                                                                                                                                                                                                                                                                                                                                    |
| <a name="criterionType"></a>type           | `string` \| [Expression Type Object](#expression-type-object) | The type of condition to be applied. If specified, the options allowed are `simple`, `regex`, `jsonpath` or `xpath`. If omitted, then the condition is assumed to be `simple`, which at most combines literals, operators and [Runtime Expressions](#runtime-expressions). If `jsonpath`, then the expression MUST conform to [JSONPath](https://tools.ietf.org/html/rfc9535). If `xpath` the expression MUST conform to [XML Path Language 3.1](https://www.w3.org/TR/xpath-31/#d2e24229). Should other variants of JSONPath or XPath be required, then a [Expression Type Object](#expression-type-object) MUST be specified. |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Criterion Object Examples

A simple Condition example:

```yaml
- condition: $statusCode == 200
```

A regex Condition example:

```yaml
- context: $statusCode
  condition: '^200$'
  type: regex
```

A JSONPath Condition example:

```yaml
- context: $response.body
  condition: $[?count(@.pets) > 0]
  type: jsonpath
```

#### Expression Type Object

An object used to describe the type and version of an expression used within a [Criterion Object](#criterion-object) or [Selector Object](#selector-object).

Defining this object gives the ability to utilize tooling compatible with older versions of either JSONPath or XPath.

##### Fixed Fields

| Field Name                              |   Type   | Description                                                                                                                                                                                                                                                                                                    |
|-----------------------------------------|:--------:|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="expressionType"></a>type       | `string` | **REQUIRED**. The selector type. The options allowed are `jsonpath`, `xpath`, or `jsonpointer`.                                                                                                                                                                                                                |
| <a name="expressionVersion"></a>version | `string` | **REQUIRED**. A short hand string representing the version of the expression type being used. The allowed values for JSONPath are `rfc9535` or `draft-goessner-dispatch-jsonpath-00`. The allowed values for XPath are `xpath-30`, `xpath-20`, or `xpath-10`. The allowed value for JSON Pointer is `rfc6901`. |

The supported expression selector types and versions are as follows:

| Type          | Allowed Versions                                 | Default    |
|---------------|--------------------------------------------------|------------|
| `jsonpath`    | `rfc9535`, `draft-goessner-dispatch-jsonpath-00` | `rfc9535`  |
| `xpath`       | `xpath-31`, `xpath-30`, `xpath-20`, `xpath-10`   | `xpath-31` |
| `jsonpointer` | `rfc6901` (added for completeness)               | `rfc6901`  |

If this object is not defined, the default version for the selector type MUST be used.

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Expression Type Examples

A JSONPath example:

```yaml
  type: jsonpath
  version: draft-goessner-dispatch-jsonpath-00
```

An XPath example:

```yaml
  type: xpath
  version: xpath-30
```

#### Selector Object

An object which enables fine-grained traversal and precise data selection from structured data such as JSON or XML, using a defined selector syntax such as JSONPath or XPath.

##### Fixed Fields

| Field Name                                 |                             Type                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                           |
|--------------------------------------------|:-------------------------------------------------------------:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="selectorObjContext"></a>context   |                         {expression}                          | **REQUIRED**. A [Runtime Expression](#runtime-expressions) which MUST evaluate to structured data (e.g., `$response.body`) and set the context for the selector to be applied on.                                                                                                                                                                                                                                                                     |
| <a name="selectorObjSelector"></a>selector |                           `string`                            | **REQUIRED**.A selector expression (e.g., `$.items[0].id`, `/Envelope/Item`) in the form of JSONPath expression, XPath expression, or JSON Pointer expression.                                                                                                                                                                                                                                                                                        |
| <a name="selectorObjType"></a>type         | `string` \| [Expression Type Object](#expression-type-object) | **REQUIRED**. The selector expression type to use (e.g., `jsonpath`, `xpath`, or `jsonpointer`). If `jsonpath`, then the expression MUST conform to [JSONPath](https://tools.ietf.org/html/rfc9535). If `xpath` the expression MUST conform to [XML Path Language 3.1](https://www.w3.org/TR/xpath-31/#d2e24229). Should other variants of JSONPath or XPath be required, then a [Expression Type Object](#expression-type-object) MUST be specified. |


##### Selector Object Examples

An output example:

```yaml
  outputs:
    userEmail:
      context: $response.body
      selector: $.user.profile.email
      type: jsonpath
```

A Step RequestBody example:

```yaml
  requestBody:
    contentType: application/json
    payload:
      invoiceId:
        context: $steps.fetchXml.outputs.invoiceXml
        selector: /Invoice/Header/InvoiceNumber
        type:
          type: xpath
          version: xpath-30
```

#### Request Body Object

A single request body describing the `Content-Type` and request body content to be passed by a step to an operation.

##### Fixed Fields

| Field Name                                         |                            Type                             | Description                                                                                                                                                                                                                                                                                                                                                                                                           |
|----------------------------------------------------|:-----------------------------------------------------------:|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="requestBodyContentType"></a>contentType   |                          `string`                           | The Content-Type for the request content. If omitted then refer to Content-Type specified at the targeted operation to understand serialization requirements.                                                                                                                                                                                                                                                         |
| <a name="requestBodyPayload"></a>payload           |                             Any                             | A value representing the request body payload. The value can be a literal value or can contain [Runtime Expressions](#runtime-expressions) or [Selector Objects](#selector-object) which MUST be evaluated prior to calling the referenced operation. To represent examples of media types that cannot be naturally represented in JSON or YAML, use a string value to contain the example, escaping where necessary. |
| <a name="requestBodyReplacements"></a>replacements | [[Payload Replacement Object](#payload-replacement-object)] | A list of locations and values to set within a payload.                                                                                                                                                                                                                                                                                                                                                               |

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### RequestBody Object Examples

A JSON templated example:

```yaml
  contentType: application/json
  payload: |
    {
      "petOrder": {
        "petId": "{$inputs.pet_id}",
        "couponCode": "{$inputs.coupon_code}",
        "quantity": "{$inputs.quantity}",
        "status": "placed",
        "complete": false
      }
    }
```

A JSON object example:

```yaml
  contentType: application/json
  payload: 
    petOrder:
      petId: $inputs.pet_id
      couponCode: $inputs.coupon_code
      quantity: $inputs.quantity
      status: placed
      complete: false
```

A complete Runtime Expression example:

```yaml
  contentType: application/json
  payload: $inputs.petOrderRequest
```

An XML templated example:

```yaml
  contentType: application/xml
  payload: |
    <petOrder>
      <petId>{$inputs.pet_id}</petId>
      <couponCode>{$inputs.coupon_code}</couponCode>
      <quantity>{$inputs.quantity}</quantity>
      <status>placed</status>
      <complete>false</complete>
    </petOrder>
```

A Form Data example:

```yaml
  contentType: application/x-www-form-urlencoded
  payload: 
    client_id: $inputs.clientId
    grant_type: $inputs.grantType
    redirect_uri: $inputs.redirectUri
    client_secret: $inputs.clientSecret
    code: $steps.browser-authorize.outputs.code
    scope: $inputs.scope  
```

A Form Data String example:

```yaml
  contentType: application/x-www-form-urlencoded
  payload: "client_id={$inputs.clientId}&grant_type={$inputs.grantType}&redirect_uri={$inputs.redirectUri}&client_secret={$inputs.clientSecret}&code{$steps.browser-authorize.outputs.code}&scope=$inputs.scope}"
```

#### Payload Replacement Object

Describes a location within a payload (e.g., a request body) and a value to set within the location.

##### Fixed Fields

| Field Name                                                            |                             Type                              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|-----------------------------------------------------------------------|:-------------------------------------------------------------:|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="payloadReplacementTarget"></a>target                         |                           `string`                            | **REQUIRED**. A [JSON Pointer](https://tools.ietf.org/html/rfc6901), or [XPath Expression](https://www.w3.org/TR/xpath-31/#id-expressions), or [JSONPath](https://tools.ietf.org/html/rfc9535) which MUST be resolved against the request body. Used to identify the location to inject the `value`.                                                                                                                                             |
| <a name="payloadReplacementTargetSelectorType"></a>targetSelectorType | `string` \| [Expression Type Object](#expression-type-object) | The selector expression type to use (e.g., `jsonpath`, `xpath`, or `jsonpointer`). If `jsonpath`, then the `target` expression MUST conform to [JSONPath](https://tools.ietf.org/html/rfc9535). If `xpath` the expression MUST conform to [XML Path Language 3.1](https://www.w3.org/TR/xpath-31/#d2e24229). Should other variants of JSONPath or XPath be required, then a [Expression Type Object](#expression-type-object) MUST be specified. |
| <a name="payloadReplacementValue"></a> value                          |  Any \| {expression} \| [Selector Object](#selector-object)   | **REQUIRED**. The value set within the target location. The value can be a constant, a [Runtime Expression](#runtime-expressions), or [Selector Objects](#selector-object) to be evaluated and passed to the referenced operation or workflow.                                                                                                                                                                                                   |

If `targetSelectorType` is omitted, then:

- `target` MUST be interpreted as [JSON Pointer](https://tools.ietf.org/html/rfc6901)if the payload is `application/json`.
- `target` MUST be interpreted as [XPath Expression](https://www.w3.org/TR/xpath-31/#id-expressions) if the payload is `application/xml` or another XML-based media type.

This object MAY be extended with [Specification Extensions](#specification-extensions).

##### Payload Replacement Object Examples

A Runtime Expression example:

```yaml
  target: /petId
  value: $inputs.pet_id
```

A literal example:

```yaml
  target: /quantity
  value: 10
```

A JSONPath example using an Expression Type Object:

```yaml
  target: $.items[?(@.sku=='ABC123')].quantity
  targetSelectorType: jsonpath
  value:
    context: $steps.getInventory.outputs.payload
    selector: $.newQuantity
    type: jsonpath
```

An XPath example using older XPATH 3.0:

```yaml
  target: /Envelope/Header/CustomerId
  targetSelectorType:
    type: xpath
    version: xpath-30
  value:
    context: $steps.fetchCustomerData.outputs.xml
    selector: /CustomerInfo/Id
    type:
      type: xpath
      version: xpath-30
```

### Runtime Expressions

A runtime expression allows values to be defined based on information that will be available within the HTTP message in an actual API call, or within objects serialized from the Arazzo document such as [workflows](#workflow-object) or [steps](#step-object).

The runtime expression is defined by the following [ABNF](https://tools.ietf.org/html/rfc5234) syntax:

```abnf
  ; Top-level expression
  expression = (
      "$url" /
      "$method" /
      "$statusCode" /
      "$request." source /
      "$response." source /
      "$message." source / 
      "$inputs." inputs-reference /
      "$outputs." outputs-reference /
      "$steps." steps-reference /
      "$workflows." workflows-reference /
      "$sourceDescriptions." source-reference /
      "$components." components-reference /
      "$self"
  )

  ; Request/Response sources
  source = ( header-reference / query-reference / path-reference / body-reference / payload-reference )
  header-reference = "header." token
  query-reference = "query." name
  path-reference = "path." name
  body-reference = "body" ["#" json-pointer ]
  payload-reference = "payload" ["#" json-pointer ]

  ; Input/Output references
  inputs-reference = input-name [ "#" json-pointer ]
  outputs-reference = output-name [ "#" json-pointer ]
  input-name = identifier
  output-name = identifier

  ; Steps expressions
  steps-reference = step-id ".outputs." output-name [ "#" json-pointer ]
  step-id = identifier-strict

  ; Workflows expressions
  workflows-reference = workflow-id "." workflow-field "." workflow-field-name [ "#" json-pointer ]
  workflow-id = identifier-strict
  workflow-field = "inputs" / "outputs"
  workflow-field-name = identifier

  ; Source descriptions expressions
  source-reference = source-name "." source-reference-id
  source-name = identifier-strict
  source-reference-id = 1*CHAR
      ; operationIds have no character restrictions in OpenAPI/AsyncAPI
      ; Resolution priority defined in spec text: (1) operationId/workflowId, (2) field names

  ; Components expressions
  components-reference = component-type "." component-name
  component-type = "parameters" / "successActions" / "failureActions"
  component-name = identifier

  ; Identifier rules
  identifier-strict = 1*( ALPHA / DIGIT / "-" / "_" )
      ; For step IDs, workflow IDs, and sourceDescription names (no dots)
      ; Matches [A-Za-z0-9_\-]+

  identifier = 1*( ALPHA / DIGIT / "." / "-" / "_" )
      ; For component keys (dots allowed)
      ; Matches [a-zA-Z0-9\.\-_]+

  name = *( CHAR )
      ; Allows unrestricted characters for query/path parameter names and field references

  ; JSON Pointer (RFC 6901)
  json-pointer = *( "/" reference-token )
  reference-token = *( unescaped / escaped )
  unescaped = %x00-2E / %x30-7A / %x7C / %x7F-10FFFF
      ; Excludes / (%x2F), { (%x7B), } (%x7D), and ~ (%x7E)
  escaped = "~" ( "0" / "1" )
      ; representing '~' and '/', respectively

  ; Token for header names (RFC 9110)
  token = 1*tchar
  tchar = "!" / "#" / "$" / "%" / "&" / "'" / "*" / "+" / "-" / "." /
          "^" / "_" / "`" / "|" / "~" / DIGIT / ALPHA

  ; CHAR definition (RFC 7159, adapted to exclude { and })
  CHAR = unescape / escape (
      %x22 /          ; "    quotation mark  U+0022
      %x5C /          ; \    reverse solidus U+005C
      %x2F /          ; /    solidus         U+002F
      %x62 /          ; b    backspace       U+0008
      %x66 /          ; f    form feed       U+000C
      %x6E /          ; n    line feed       U+000A
      %x72 /          ; r    carriage return U+000D
      %x74 /          ; t    tab             U+0009
      %x75 4HEXDIG )  ; uXXXX                U+XXXX
  escape = %x5C       ; \
  unescape = %x20-21 / %x23-5B / %x5D-7A / %x7C / %x7E-10FFFF
      ; Excludes { (%x7B) and } (%x7D) for unambiguous embedded expression parsing

  ; Expression strings
  expression-string = *( literal-char / embedded-expression )
  embedded-expression = "{" expression "}"
  literal-char = %x00-7A / %x7C / %x7E-10FFFF
      ; Excludes { and } - simpler than CHAR for literal text

  ; Core ABNF rules (RFC 5234)
  ALPHA = %x41-5A / %x61-7A   ; A-Z / a-z
  DIGIT = %x30-39             ; 0-9
  HEXDIG = DIGIT / "A" / "B" / "C" / "D" / "E" / "F" 
```

Here, `json-pointer` is taken from [RFC6901](https://tools.ietf.org/html/rfc6901), `CHAR` from [RFC7159](https://tools.ietf.org/html/rfc7159#section-7) and `token` from [RFC7230](https://tools.ietf.org/html/rfc7230#section-3.2.6).

The `name` identifier is case-sensitive, whereas `token` is not.

#### Examples

| Source Location              | example expression                                                   | notes                                                                                                                                                                                            |
|------------------------------|:---------------------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| HTTP Method                  | `$method`                                                            | The allowable values for the `$method` will be those for the HTTP operation.                                                                                                                     |
| Requested media type         | `$request.header.accept`                                             |                                                                                                                                                                                                  |
| Request parameter            | `$request.path.id`                                                   | Request parameters MUST be declared in the `parameters` section of the parent operation or they cannot be evaluated. This includes request headers.                                              |
| Request body property        | `$request.body#/user/uuid`                                           | In operations which accept payloads, references may be made to portions of the `requestBody` or the entire body.                                                                                 |
| Request URL                  | `$url`                                                               |                                                                                                                                                                                                  |
| Response value               | `$response.body#/status`                                             | In operations which return payloads, references may be made to portions of the response body or the entire body.                                                                                 |
| Response array element       | `$response.body#/items/0/id`                                         | Array elements can be accessed using numeric indices in JSON Pointer syntax.                                                                                                                     |
| Response header              | `$response.header.Server`                                            | Single header values only are available.                                                                                                                                                         |
| Message header               | `$message.header.Server`                                             | Single header values only are available.                                                                                                                                                         |
| Payload value                | `$message.payload#/status`                                           | In operations which return payloads, references may be made to portions of the payload or the entire payload.                                                                                    |
| Self URI                     | `$self`                                                              | References the canonical URI of the current Arazzo Description as defined by the `$self` field.                                                                                                  |
| Workflow input               | `$inputs.username` or `$workflows.foo.inputs.username`               | Single input values only are available.                                                                                                                                                          |
| Step output value            | `$steps.someStepId.outputs.pets`                                     | In situations where the output named property return payloads, references may be made to portions of the response body (e.g., `$steps.someStepId.outputs.pets#/0/id`) or the entire body.        |
| Workflow output value        | `$outputs.bar` or `$workflows.foo.outputs.bar`                       | In situations where the output named property return payloads, references may be made to portions of the response body (e.g., `$workflows.foo.outputs.mappedResponse#/name`) or the entire body. |
| Embedded expressions         | `https://{$inputs.host}/api/{$steps.create.outputs.id}/status`       | Multiple runtime expressions can be embedded within a single string value by wrapping each in curly braces.                                                                                      |
| Source description reference | `$sourceDescriptions.petstore.getPetById`                            | References an operationId or workflowId from the named source description. Resolution priority: (1) operationId/workflowId, (2) field names.                                                     |
| Source description field     | `$sourceDescriptions.petstore.url`                                   | References a field from the Source Description Object. Resolved when no matching operationId/workflowId is found.                                                                                |
| Components parameter         | `$components.parameters.foo`                                         | Accesses a foo parameter defined within the Components Object.                                                                                                                                   |
| Components action            | `$components.successActions.bar` or `$components.failureActions.baz` | Accesses a success or failure action defined within the Components Object.                                                                                                                       |

Runtime expressions preserve the type of the referenced value.
Expressions can be embedded into string values by surrounding the expression with `{}` curly braces. When a runtime expression is embedded in this manner, the following rules apply based on the value type:

- Scalar values (string, number, boolean, null) are converted to their string representation.
- Complex values (object, array) are handled based on their current representation:
  - If the value is already a string (e.g., an XML or YAML response body stored without parsing), it is embedded as-is without modification.
  - If the value is a parsed structure (e.g., a JSON object or array from a parsed response, or workflow input), it MUST be serialized as JSON per RFC 8259.

Whether a value is stored as a string or parsed structure depends on its content type. JSON responses and inputs are typically parsed into structures, while XML and plain text are typically stored as strings. When embedding a parsed structure into a non-JSON payload format, the resulting JSON serialization may not match the target format's expected structure.

#### Source Description Expression Resolution

When using `$sourceDescriptions.<name>.<reference>`, the `<reference>` portion is resolved with the following priority:

- **operationId or workflowId** - If the referenced source description is an OpenAPI description, `<reference>` is first matched against operationIds. If the source description is an Arazzo document, `<reference>` is matched against workflowIds.
- **Source description field** - If no operationId/workflowId match is found, `<reference>` is matched against field names of the Source Description Object (e.g., `url`,
  `type`).

**Examples:**

Given this source description:

```yaml
sourceDescriptions:
  - name: petstore
    url: https://api.example.com/petstore.yaml
    type: openapi
```

Given the above example source description and an OpenAPI description at that specified URL containing an operation with operationId: `getPetById`:

- `$sourceDescriptions.petstore.getPetById` resolves to the operation with operationId `getPetById` (_priority 1_)
- `$sourceDescriptions.petstore.url` resolves to `https://api.example.com/petstore.yaml` (_priority 2_)
- `$sourceDescriptions.petstore.type` resolves to `openapi` (_priority 2_)

If an operationId happens to conflict with a field name (e.g., an operation with operationId: url), the operationId takes precedence.

### Specification Extensions

While the Arazzo Specification tries to accommodate most use cases, additional data can be added to extend the specification at certain points.

The extension properties are implemented as patterned fields that are always prefixed by `"x-"`.

| Field Pattern                      | Type | Description                                                                                                                                                                                                                                                                                                                   |
|------------------------------------|:----:|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| <a name="arazzoExtensions"></a>^x- | Any  | Allows extensions to the Arazzo Specification. The field name MUST begin with `x-`, for example, `x-internal-id`. Field names beginning `x-oai-`, `x-oas-`, and `x-arazzo` are reserved for uses defined by the [OpenAPI Initiative](https://www.openapis.org/). The value MAY be `null`, a primitive, an array or an object. |

The extensions may or may not be supported by the available tooling, but those may be extended as well to add requested support (if tools are internal or open-sourced).

## Security Considerations

The Arazzo Specification does not enforce a security mechanism. Security is left to the implementer, though TLS, specifically HTTPS may be recommended for exchanging sensitive workflows.

Arazzo Descriptions can be JSON or YAML values. As such, all security considerations defined in [RFC8259](https://tools.ietf.org/html/rfc8259) and within YAML version [1.2](https://yaml.org/spec/1.2/spec.html) apply.

Arazzo Descriptions are frequently written by untrusted third parties, to be deployed on public Internet servers. Processing an Arazzo Description can cause both safe and unsafe operations to be performed on arbitrary network resources. It is the responsibility of the description consumer to ensure that the operations performed are not harmful.

## IANA Considerations

The proposed MIME media types for the Arazzo Specification are described below.

### application/vnd.oai.workflows

The default (or general) MIME type for Arazzo documents (e.g. workflows) is defined as follows:

&emsp; Media type name: application

&emsp; Media subtype name: vnd.oai.workflows

&emsp; Required parameters: N/A

&emsp; Optional parameters: version (e.g. version=1.0.0 to indicate that the type of workflow conforms to version 1.0.0 of the Arazzo Specification).

&emsp; Encoding considerations: Encoding considerations are identical to those specified for the `application/json` and `application/yaml` media types, respectively.

&emsp; Security considerations: See [security considerations](#security-considerations) above.

&emsp; Interoperability considerations: N/A

**Note:** When using the `application/vnd.oai.workflows` media type the consumer should be prepared to receive YAML formatted content

### application/vnd.oai.workflows+json

The proposed MIME media type for Arazzo documents (e.g. workflows) that require a JSON-specific media type is defined as follows:

&emsp; Media type name: application

&emsp; Media subtype name: vnd.oai.workflows+json

&emsp; Required parameters: N/A

&emsp; Optional parameters: version (e.g. version=1.0.0 to indicate that the type of Arazzo document conforms to version 1.0.0 of the Arazzo Specification).

&emsp; Encoding considerations: Encoding considerations are identical to those specified for the `application/json` media type.

&emsp; Security considerations: See [security considerations](#security-considerations) above.

&emsp; Interoperability considerations: N/A

### application/vnd.oai.workflows+yaml

The proposed MIME media type for Arazzo documents (e.g. workflows) that require a YAML-specific media type is defined as follows:

&emsp; Media type name: application

&emsp; Media subtype name: vnd.oai.workflows+yaml

&emsp; Required parameters: N/A

&emsp; Optional parameters: version (e.g. version=1.0.0 to indicate that the type of Arazzo document conforms to version 1.0.0 of the Arazzo Specification).

&emsp; Encoding considerations: Encoding considerations are identical to those specified for the `application/yaml` media type.

&emsp; Security considerations: See [security considerations](#security-considerations) above.

&emsp; Interoperability considerations: N/A

## Appendix A: Revision History

| Version | Date       | Notes                                           |
|---------|------------|-------------------------------------------------|
| 1.1.0   | 2026-04-16 | Minor release of the Arazzo Specification 1.1.0 |
| 1.0.1   | 2025-01-16 | Patch release of the Arazzo Specification 1.0.1 |
| 1.0.0   | 2024-05-29 | First release of the Arazzo Specification       |

## Appendix B: Examples of Base URI Determination and Reference Resolution

This appendix provides concrete examples demonstrating how the [`$self`](#arazzoSelf) field, Source Description URLs, and relative references work together across different deployment scenarios.

### Base URI Within Content (Using `$self`)

Assume the following Arazzo document is retrieved from `file:///Users/dev/projects/workflows/purchase.arazzo.yaml`:

```yaml
arazzo: 1.1.0
$self: https://api.example.com/workflows/purchase.arazzo.yaml
info:
  title: Pet Purchase Workflow
  version: 1.0.0
sourceDescriptions:
  - name: petstore
    url: ../specs/petstore.yaml  # Resolves to https://api.example.com/specs/petstore.yaml
    type: openapi
```

The relative URL `../specs/petstore.yaml` resolves against the `$self` base URI `https://api.example.com/workflows/purchase.arazzo.yaml`. The resolution algorithm per [RFC3986 Section 5.2](https://tools.ietf.org/html/rfc3986#section-5.2) removes the final path segment during resolution, producing `https://api.example.com/specs/petstore.yaml`, regardless of the retrieval URI.

### Base URI From the Retrieval URI (No `$self`)

If the same document does not define `$self`:

```yaml
arazzo: 1.1.0
# No $self field
info:
  title: Pet Purchase Workflow
  version: 1.0.0
sourceDescriptions:
  - name: petstore
    url: ../specs/petstore.yaml
    type: openapi
```

Retrieved from `file:///Users/dev/projects/workflows/purchase.arazzo.yaml`, the relative URL resolves to `file:///Users/dev/projects/specs/petstore.yaml`.

### Base URI From Encapsulating Entity

Per [RFC3986 Section 5.1.2](https://tools.ietf.org/html/rfc3986#section-5.1.2), the base URI can be provided by an encapsulating entity. For example, in a `multipart/related` response where an Arazzo Description is embedded:

```http
Content-Type: multipart/related; boundary=example; type=application/vnd.oai.arazzo+json

--example
Content-Type: application/vnd.oai.arazzo+json
Content-Location: https://api.example.com/workflows/purchase.arazzo.json

{
  "arazzo": "1.1.0",
  "info": {...},
  "sourceDescriptions": [
    {
      "name": "petstore",
      "url": "../specs/petstore.json"
    }
  ]
}
--example--
```

The `Content-Location` header provides the base URI (`https://api.example.com/workflows/purchase.arazzo.json`), so `../specs/petstore.json` resolves to `https://api.example.com/specs/petstore.json` even without a `$self` field.

### Application-Specific Default Base URI

Per [RFC3986 Section 5.1.4](https://tools.ietf.org/html/rfc3986#section-5.1.4), applications may define default base URIs. For documents loaded without explicit retrieval URIs (e.g., from a database), implementations typically generate a unique base URI per document using a fixed prefix plus a unique identifier.

For example, a workflow orchestration platform might construct base URIs as `https://workflows.example.com/{uuid}` for each document:

```yaml
arazzo: 1.1.0
# No $self field
# Loaded from database, assigned base URI: https://workflows.example.com/a7b3c4d5
info:
  title: Pet Purchase Workflow
  version: 1.0.0
sourceDescriptions:
  - name: petstore
    url: specs/petstore.yaml  # Resolves using application default
```

If the application assigns base URI `https://workflows.example.com/a7b3c4d5` to this document, then `specs/petstore.yaml` resolves to `https://workflows.example.com/specs/petstore.yaml`.

**Note:** While a base URI of `https://workflows.example.com/` (with trailing slash) is technically valid per RFC3986, the final path component is an empty string. In practice, implementations typically assign unique identifiers as the final component to distinguish documents.

### Resolving Relative `$self`

When `$self` is itself a relative URI-reference, it must be resolved before being used as a base URI:

```yaml
arazzo: 1.1.0
$self: workflows/purchase.arazzo.yaml
info:
  title: Pet Purchase Workflow
  version: 1.0.0
sourceDescriptions:
  - name: petstore
    url: ../specs/petstore.yaml
```

Retrieved from `https://api.example.com/v2/api-description.yaml`:

1. First, resolve the `$self` relative reference `workflows/purchase.arazzo.yaml` against the base URI `https://api.example.com/v2/api-description.yaml`, which resolves to `https://api.example.com/v2/workflows/purchase.arazzo.yaml` per [RFC3986 Section 5.2](https://tools.ietf.org/html/rfc3986#section-5.2).
2. Then resolve the Source Description `url` relative reference `../specs/petstore.yaml` against the resolved `$self` base URI `https://api.example.com/v2/workflows/purchase.arazzo.yaml`, which resolves to `https://api.example.com/v2/specs/petstore.yaml`.

### Identity vs Location: Why `$self` Matters

An Arazzo Description may be retrieved from multiple locations but have a single canonical identity. Consider:

```yaml
arazzo: 1.1.0
$self: https://workflows.example.com/canonical/purchase.arazzo.yaml
info:
  title: Pet Purchase Workflow
  version: 1.0.0
```

This document might be:

- Retrieved from `https://cdn.example.com/cache/abc123.yaml`
- Retrieved from `file:///local/dev/purchase.arazzo.yaml`
- Embedded in a `multipart/related` response

In all cases, references to this Arazzo Description MUST use `https://workflows.example.com/canonical/purchase.arazzo.yaml` (the `$self` value), not the retrieval location. This ensures that references remain stable even when the document is mirrored, cached, or moved.

Identity-based referencing via `$self` is particularly valuable in security-restricted environments. When deploying document sets behind firewalls or on air-gapped networks, implementations can scan for `$self` values to locate documents from a provided collection without making network requests that security policies might prevent. This enables reference resolution in environments where external network access is restricted or prohibited.
