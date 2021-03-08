# ts-prm: TypeScript Project Reference Merge 

[![Build Status](https://dev.azure.com/sethlessard0602/sethlessard/_apis/build/status/sethlessard.ts-prm?branchName=v1.0.0-prep)](https://dev.azure.com/sethlessard0602/sethlessard/_build/latest?definitionId=7&branchName=v1.0.0-prep)

This CLI application is a helper for TypeScript's project reference feature when using "sub-projects" (nested TypeScript projects). As of now, this is simply a proof of concept.

- [ts-prm: TypeScript Project Reference Merge](#ts-prm-typescript-project-reference-merge)
  - [Why?](#why)
  - [Installation](#installation)
  - [Configuration File](#configuration-file)
    - [Example Configuration File](#example-configuration-file)
  - [Usage](#usage)
    - [ts-prm merge](#ts-prm-merge)
    - [ts-prm validate](#ts-prm-validate)

## Why?

The overall idea is that subprojects should be independently developable by multiple developers (maybe the subprojects are git submodules). A current limitation with nested [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) is that any reference to a dependency in a nested `node_modules` folder will not resolve once the TypeScript project is built. 

Take the following example:

```bash
main-project
│   .tsprm.json
│   package.json
│   tsconfig.json
|   node_modules
├───build
│       index.js
├───src
│       index.ts
├───subproject1
|   |   node_modules
│   │   package.json
│   │   tsconfig.json
│   ├───src
│   └───test
├───subproject2
|   |   node_modules
│   │   package.json
│   │   tsconfig.json
│   ├───src
│   └───test
├───subproject3
|   |   node_modules
│   │   package.json
│   │   tsconfig.json
│   ├───src
│   └───test
└───test
```

`subproject1`, `subproject2`,  and `subproject3` are all independently developable. They have their own specified dependencies and devlopment dependencies, both of which can be found in their respective `package.json` files and `node_module` folders. They also have their own tests and can be independently built by TypeScript.

When building the project, a `dist/` or `build/` (or whatever you specify as the `outDir` in the top-level `tsconfig.json`) folder with the compiled JavaScript of all subprojects + the main project will be created. The JavaScript in the build folder is still referencing node_modules dependencies from the subprojects. The top level node_modules will not contain the subproject node_modules dependencies.

`ts-prm` tries to fix that issue by merging the `dependencies` and `devDependencies` fields of multiple subproject package.json files into a single top-level package.json file.

## Installation 

With npm:
```bash
npm install -g ts-prm
```

with yarn
```bash
yarn global add ts-prm
```

## Configuration File

`ts-prm` depends on a configuration file that is placed in the root directory of your project. All paths within the configuration file will be relative to the configuration file. The `ts-prm` configuraiton file will specify the TypeScript subprojects. The TypeScript subprojects must contain a `package.json` and `tsconfig.json` file.

### Example Configuration File

```json
{
  "version": "1.0.0",
  "projects: [
    {
      "rootPath": "subproject1/"
    },
    {
      "rootPath": "subproject2/"
    },
    {
      "rootPath": "subproject3/"
    }
  ]
}
```

## Usage 

### ts-prm merge

Merge the dependencies (and devDependencies) of one or more TypeScript project references into a single upper-level `package.json` file.

```bash
ts-prm merge

Merge the dependencies of one or more subprojects (TypeScript project
references) into a single top-level package.json file

Options:
      --help                  Show help                                [boolean]
      --version               Show version number                      [boolean]
  -c, --configFile, --config  The path to the ts-prm config file (.tsprm.json)
                                                                        [string]
  -i, --install               Install node dependencies after merging the
                              typescript submodules.  [boolean] [default: false]
      --skipDev               If true, development dependencies will not be
                              merged.                 [boolean] [default: false]
      --packageManager        The node_modules package manager to use for
                              dependency installation.
                             [string] [choices: "yarn", "npm"] [default: "yarn"]
```

### ts-prm validate

Validate a ts-prm configuration file.

```bash
ts-prm validate

Validate a configuration file

Options:
      --help                  Show help                                [boolean]
      --version               Show version number                      [boolean]
  -c, --configFile, --config  The path to the ts-prm config file (.tsprm.json)
                                                                        [string]
```

TODO: complete this
