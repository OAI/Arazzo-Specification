# OpenAPI Initiative (OAI) Workflows Special Interest Group

Work on the Arazzo Specification started under the remit of the OAI Workflows Special Interest Group (SIG-Workflows). The Workflows SIG provides a single place to manage artifacts, discussions, projects, and other aspects relating to how workflows can be represented using, or in combination with, the OpenAPI specification.

## OpenAPI Special Interest Groups (SIGs)

OpenAPI Special Interest Groups, or "SIGs", are the OpenAPI Initiative's way of focusing work in particular areas.  SIGs may start with just a Slack channel to determine interest.  SIGs with enough traction to produce work may have their own GitHub repositories and regular Zoom calls, and ultimately produce work that becomes part of, or a companion to, the OpenAPI Specification.

For more information, see [OAI Special Interest Groups](https://github.com/OAI/OpenAPI-Specification/blob/main/SPECIAL_INTEREST_GROUPS.md).

## Workflows Special Interest Group - Charter / Motivation

Being able to express specific sequences of calls and articulate the dependencies between them to achieve a particular goal is desirable in the context of an API specification. 

Our aim is to propose an enhancement to the current OpenAPI, or accompanying specification (or means), that can define sequences of calls and their dependencies to be expressed in the context of delivering a particular outcome or set of outcomes. 

The creation of the SIG-Workflows group is inspired by the need to store sequences of calls in the context of specific tests, and in order to communicate the particulars of a complex set of security related calls such as when using OAuth2 and the Financial-grade API security profile of OpenID Connect. 

However, such a definition will be useful for understanding how to implement any dependent sequence of functional calls for any user of an API such as authorization calls, redirects and web hooks in order to achieve a certain technical or functional outcome.

Optimally, it should be possible to articulate these workflows in a human and machine readable manner, thus improving the capability of API specifications to tell the story of the API in a manner that can improve the consuming developer experience and understanding of an API specified using OpenAPI (or other supported specifications).

**Key focus areas**
- **Context** - How to define quickly and easily what goal and key functions of an API are, and how to represent that in a specification
- **Workflows** - Handling key and complex sequences which may involve the reuse of endpoints for multiple uses, like token calls in a FAPI compliant sequence, in both a human and machine readable way, supporting both understanding and automation
- **Tooling** - How to best integrate to tools and provide machine readable context for those tools so that the spec can integrate with the tools used by developers

## Special Interest Group (SIG)

The initial Workflows SIG was made up of the following individuals.

### Champions

- David O'Neill ([COO, APIContext](https://www.linkedin.com/in/davidon/))
- Kin Lane ([API Governance Lead, Bloomberg](https://www.linkedin.com/in/kinlane/))
- Frank Kilcommins ([API Evangelist, SmartBear](https://www.linkedin.com/in/frank-kilcommins))

### Contributors

- Nick Denny ([Chief Engineer, APIContext](https://www.linkedin.com/in/nickdenny/))
- Frank Kilcommins ([API Evangelist, SmartBear](https://www.linkedin.com/in/frank-kilcommins))
- Mike Ralphson ([OpenAPI Specification Lead, Postman](https://www.linkedin.com/in/mikeralphson/))
- Alessandro Duminuco ([Senior Technical Leader, Cisco](https://www.linkedin.com/in/alessandroduminuco/))
- Mark Haine ([Founder, Considrd Consulting](https://www.linkedin.com/in/mark-haine/))
- Phil Sturgeon ([API Consultant](https://www.linkedin.com/in/philipsturgeon/))
- Kevin Duffey ([Tech Lead](https://www.linkedin.com/in/kmd/))
- Shai Sachs ([Staff Engineer, Chewy](https://linkedin.com/in/shaisachs/))
