# npm-audit-pipeline
[![Build](https://github.com/acordiner92/npm-audit-pipeline/actions/workflows/build_and_test.yml/badge.svg?branch=master)](https://github.com/acordiner92/npm-audit-pipeline/actions/workflows/build_and_test.yml)

Npm audit pipeline is an npm library that can be used in your CI pipelines to determine whether your packages have any vulnerabilities and failing over if so. It supports package manager's npm, yarn and pnpm

## Installation
```bash
$ npm i npm-audit-pipeline --save-dev
```

## How to use it
In its simplest form you can it to the package.json script section like so:

```json
"scripts": {
  "package-audit": "npm-audit"
}
```
Then you can run as:
```bash
$ npm run package-audit
```

If required you can also specify how many errors are allowed to be passed through for each vulnerability level. By default all levels are set to **0**. For example:
```bash
$ npm-audit --low=4 --moderate=3 --high=2 --critical=1
```
 This means if there are 4 low level, 3 moderate, 2 high and 1 critical vulnerabilities when packages are checked then it will pass. If in a situation there are 5 low level vulnerabilities then it will fail because its greater than 4 specifed in the arguments

```bash
$ npm-audit --shouldWarn 
```
 shouldWarn flag means the vulnerablities will be logged to stdout however the pipeline will successfully pass
 
 ```bash
$ npm-audit --retry=10
 ```
 retry flag means the number of retry attempts to fetch npm audit if it fails to retrieve the data
 
```bash
$ npm-audit --package-manager=yarn
```
package-manager flag means you can specify other package managers if your not using npm which is default. The current supported values are npm, yarn and pnpm. 
### License

npm-audit-pipeline is [Apache 2.0](./LICENSE).
