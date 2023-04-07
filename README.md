# OpenAPI Initiative (OAI) Workflows Special Interest Group

This is a public repository for managing work around the OAI Workflows Special Interest Group (SIG-Workflows), 
providing a single place to manage artifacts, discussions, projects, and other aspects relating to how workflows can be represented using, or in combination with, the OpenAPI specification.

## Charter / Motivation

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

The current SIG is made up of the following individuals, and feel free to submit an issue requesting to be added.

### Champions

- David O'Neill ([CEO, APImetrics](https://www.linkedin.com/in/davidon/))
- Kin Lane ([Chief Evangelist, Postman](https://www.linkedin.com/in/kinlane/))

### Contributors

- Nick Denny ([VP Engineering, APImetrics](https://www.linkedin.com/in/nickdenny/))
- Frank Kilcommins ([API Evangelist, SmartBear](https://www.linkedin.com/in/frank-kilcommins))
- Mike Ralphson ([OpenAPI Specification Lead, Postman](https://www.linkedin.com/in/mikeralphson/))
- Alessandro Duminuco ([Senior Technical Leader, Cisco](https://www.linkedin.com/in/alessandroduminuco/))
- Mark Haine ([Founder, Considrd Consulting](https://www.linkedin.com/in/mark-haine/))
- Phil Sturgeon ([Dev Rel, Stoplight](https://www.linkedin.com/in/philipsturgeon/))
- Kevin Duffey ([Tech Lead, Postman](https://www.linkedin.com/in/kmd/))

## The Workflows Specification

The draft version of the Workflows Specification can be found [here](./versions/1.0.0.md).

## Getting Involved

This working group is just getting started, but feel free to get involved via one (or more) of the channels below.

- [Bi-weekly Call](https://github.com/OAI/sig-workflows/discussions/5) - Wednesdays at 09:00 AM PDT
- [Discussions](https://github.com/OAI/sig-workflows/discussions) - Use the GitHub discussions to ask questions, provide opinions and engage with the group
- [Issues](https://github.com/OAI/sig-workflows/issues) - Feel free to submit a Github issue with any question or comment about the working group
- [Projects](https://github.com/OAI/sig-workflows/projects) - Keep up to speed on the various projects occurring via Github projects for this group
- Slack - if you have access to the OpenAPI slack workspace, then join the `sig-workflows` channel. If you do not have access, you're welcome to join by clicking [here](https://communityinviter.com/apps/open-api/openapi)
