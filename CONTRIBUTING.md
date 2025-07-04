# Contribute to the Arazzo Specification

We welcome contributions and discussion.
Bug reports and feature requests are welcome, please add an issue explaining your use case.
Pull requests are also welcome, but it is recommended to create an issue first, to allow discussion.

Questions and comments are also welcome - use the GitHub Discussions feature.
You will also find notes from past meetings in the Discussion tab.

## Key information

This project is covered by our [Code of Conduct](https://github.com/OAI/OpenAPI-Specification?tab=coc-ov-file#readme).
All participants are expected to read and follow this code.

No changes, however trivial, are ever made to the contents of published specifications (the files in the `versions/` folder).
Exceptions may be made when links to external documents have been changed by a 3rd party, in order to keep our documents accurate.

Published versions of the specification are in the `versions/` folder.
The under-development versions of the specification are in the file `src/arazzo.md` on the appropriately-versioned branch.
For example, work on the next release for 1.1 is on `v1.1-dev` in the file `src/arazzo.md`.

The [spec site](https://spec.openapis.org) is the source of truth for the Arazzo specification as it contains all the citations and author credits.

The OpenAPI project (which Arazzo sits under) is almost entirely staffed by volunteers.
Please be patient with the people in this project, who all have other jobs and are active here because we believe this project has a positive impact in the world.

### Active branches

The current active specification releases are:

| Version | Branch | Notes |
| ------- | ------ | ----- |
| 1.0.2 | `v1.0-dev` | active patch release line |
| 1.1.0 | `v1.1-dev` | minor release in development |

## Pull Requests

Pull requests are always welcome but please read the section below on [branching strategy](#branching-strategy) before you start.

Pull requests MUST come from a fork; create a fresh branch on your fork based on the target branch for your change.

### Branching Strategy

Overview of branches:

- `main` holds the published versions of the specification, utility scripts and supporting documentation.
- `dev` is for development infrastructure and other changes that apply to multiple versions of development.
- Branches named `vX.Y-dev` are the active development branches for future releases.
- Branches name `vX.Y.Z-rel` are release branches (including when Z == 0). They exist primarily for `git mv`-ing `src/oas.md` to the appropriate `versions/X.Y.Z.md` location before merging back to `main`, and can also be used for any emergency post-release fixes that come up, such as when a 3rd party changes URLs in a way that breaks published links.

> All changes should be applied to the _earliest_ branch where the changes are relevant in the first instance.

## Release Process and Scope

### Minor Releases

Our roadmap for Arazzo releases is community-driven, meaning the specification is open for proposed additions by anyone.

Changes in minor releases (such as 1.1) meet the following criteria:

- Are **backwards-compatible** and be reasonably easy to implement in tooling that already supports the previous minor version.
  For example, new optional fields can be added.
- Drive quality-of-life improvements to support how Arazzo is used by practitioners, so that Arazzo evolves to continue to meet user needs.
  For example, adding fields to support changes in other standards, or adopting common `x-*` extension fields into the specification.
- Make the specification document clearer or easier to understand.

A minor release is due when there are some meaningful features (including one or a small number of headline features).

### Patch Releases

Patch releases reflect a constant quest for improving the active minor versions of Arazzo.
Since we do not edit specification documents after publication, even the smallest change has to be in a new release.

Changes in patch releases meet the following criteria:

- Editorial changes such as spelling or formatting fixes, including link updates.
- Clarifications or additions that do not change the meaning of the specification.

Patch releases are created as often as there are changes to the specification worth releasing.

## Get in touch

To get in touch with other people on the project, ask questions, or anything else:

- Find us [on the OpenAPI Slack](https://communityinviter.com/apps/open-api/openapi) and join the `#arazzo` channel.
- Start a [GitHub Discussion](https://github.com/OAI/Arazzo-Specification/discussions/).
- Join one of our weekly meetings by checking the [issues list for an upcoming meetings](https://github.com/OAI/Arazzo-Specification/issues?q=is%3Aissue%20state%3Aopen%20label%3AHouse-keeping).

## Appendix

### Build the HTML version to publish

We use ReSpec to render the markdown specification as HTML for publishing and easier reading.
These instructions explain how you can build the HTML locally.

You will need NodeJS 18 or later.

Install dependencies:

```sh
npm install
```

Produce stand-alone HTML files in the local `deploy/arazzo` folder:

```sh
npm run build
```

Note that Linux users may need to add `--no-sandbox` to run `npx respec` as found in the `scripts/md2html/build.sh` file.
