# Data Positioning Default Context

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
<span><!-- OWASP_BADGES_START -->
[![OWASP](https://img.shields.io/badge/OWASP-passed-4CAF50)](https://dpuse.github.io/dpuse-context-default/dependency-check-reports/dependency-check-report.html)
<!-- OWASP_BADGES_END --></span>

A TypeScript library that implements the default context.

## Installation

There’s no need to install this context manually. Once released, it’s uploaded to the Data Positioning Engine cloud and becomes instantly available to all new instances of the browser app. A notification about the new version is also sent to all existing browser apps.

## Reports & Compliance

### Dependency Check Report

The OWASP Dependency Check Report identifies known vulnerabilities in project dependencies. It is generated automatically on each release using the npm package `owasp-dependency-check`. We also rely on GitHub Dependabot to continuously check for vulnerabilities across all dependencies.

[View the OWASP Dependency Check Report](https://data-positioning.github.io/dpuse-context-default/dependency-check-reports/dependency-check-report.html)

### Dependency Licenses

The following table lists top-level production and peer dependencies. All these dependencies (including transitive ones) have been recursively verified to use Apache-2.0, CC0-1.0, or MIT—commercially friendly licenses with minimal restrictions. Developers cloning this repository should independently verify dev and optional dependencies; users of the uploaded library are covered by these checks.

<!-- DEPENDENCY_LICENSES_START -->
|Name|Type|Installed|Latest|Latest Released|Deps|Document|
|:-|:-|:-:|:-:|:-|-:|:-|
|@dpuse/dpuse-shared|MIT|0.3.595|0.3.595|this month: 2026-03-23|0|[LICENSE](https://raw.githubusercontent.com/dpuse/dpuse-shared/main/LICENSE)|

<!-- DEPENDENCY_LICENSES_END -->

**Installed dependencies are kept up-to-date with latest releases.**

### Bundle Analysis Report

The Bundle Analysis Report provides a detailed breakdown of the bundle's composition and module sizes, helping to identify which modules contribute most to the final build. It is generated automatically on each release using the npm package `rollup-plugin-visualizer`.

[View the Bundle Analysis Report](https://data-positioning.github.io/dpuse-context-default/stats/index.html)

## Repository Management Commands

The following list details the repository management commands implementation by this project. For more details, please refer to the scripts section of the 'package.json' file in this project.

| Name           | VS Code Shortcuts | Notes                                                                                                           |
| -------------- | ----------------- | --------------------------------------------------------------------------------------------------------------- |
| audit          | alt+ctrl+shift+a  | Audit the project's dependencies for known security vulnerabilities.                                            |
| build          | alt+ctrl+shift+b  | Type-check, compile and minify for production. Output in '/dist' directory.                                     |
| check          | alt+ctrl+shift+c  | List the dependencies in the project that are outdated.                                                         |
| document       | alt+ctrl+shift+d  | Identify the licenses of the project's dependencies.                                                            |
| format         | alt+ctrl+shift+f  | Enforce formatting style rules.                                                                                 |
| lint           | alt+ctrl+shift+l  | Check the code for potential errors and enforces coding styles.                                                 |
| release        | alt+ctrl+shift+r  | Synchronise local repository with the main GitHub repository and upload connector to Data Positioning platform. |
| syncWithGitHub | alt+ctrl+shift+s  | Synchronise local repository with the main GitHub repository.                                                   |
| update         | alt+ctrl+shift+l  | Install the latest version of Data Positioning dependencies.                                                    |

## License

[MIT](./LICENSE) © 2026 Data Positioning Pty Ltd
