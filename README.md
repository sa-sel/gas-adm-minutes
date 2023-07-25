# GAS Config Boilerplate

## Summary

1. [Abstract](#abstract)
2. [Setup](#setup)
   1. [Environment Variables](#environment-variables)
   2. [Depencencies](#dependencies)
   3. [Clasp](#clasp)
3. [GitHub Actions](#github-actions)
4. [Development](#Developtment)
   1. [Directory Structure](#directory-structure)
   2. [Formatting and Conventions](#formatting)
   3. [Commit Messages](#commit)
   4. [Deploying to GAS](#deploy)
   5. [Workflow](#workflow)

## <a id="abstract"></a> Abstract

This repository provides boilerplate configurations for SA-SEL's **G**oogle **A**pps **S**cripts projects:

- Git hooks (via Husky);
  - Linting/autoformatting staged files on commit;
  - Commit message style checking/enforcing.
- GitHub Workflows for linting and deploying;
- GitHub PR and issue templates;
- Node, TypeScript, Prettier and ESLint configs;
- Script for syncing the GitHub repository with a GAS project (via Clasp);
- Script for compiling all of the code inside `src/` and then pushing it to GAS (via Clasp);
  - Merging everything into a single file;
  - Transpiling this file to JavaScript;
  - Removing all `export` statements from this file.
  - Setting up the correct directory structure;
- README template (yes, this one).

Most of these items have the goal to facilitate the development of GAS projects locally with autocompletion in TypeScript, using multiple modules and path aliases.

## <a id="setup"></a> Setup

In order to contribute to this project and code locally using autocompletion, you must execute a couple of simple steps to set it up.

### <a id="envirnment-variables"></a> Environment Variables

Provide a `.env` file in the same format as the `.env.example`:

```bash
cp .env.example .env
```

In this file, you must specify the `SCRIPT_ID`[^1] to the project you're working on. Create a copy of the project's main Google Sheet for you to work on and provide that Sheet's script's ID.

[^1]: e.g.: https://script.google.com/home/projects/SCRIPT_ID/edit

### <a id="dependencies"></a> Dependencies

The project's only external dependency is [Node 16](https://nodejs.org/en/), so install it before proceeding. The other dependencies (packages) are listed in `package.json`. In order to install them, run:

```bash
npm run submodules
npm install
```

This command will also link your local environment to the project with specified ID (see [previous section](#environment-variables)).

### <a id="clasp"></a> Clasp

Now that you have Clasp installed, you must log in to it using a Google account that has access to the Script project. To do that, run:

```bash
npx clasp login
```

You must also enable the Google Apps Script API for that account in [https://script.google.com/home/usersettings](https://script.google.com/home/usersettings).

## <a id="github-actions"></a> GitHub Workflows

For the GitHub Workflows configured in `.github/workflows` to work properly (specifically the deploy action), you must create the following secrets in your repository/GitHub organizations.

![GitHub Secrets screenshot](./.github/images/github-secrets.png)

Aside from the script id (this is the same script id describe in the [environment variables section](#environment-variables)), the data for the secrets can be found in the file `~/.clasprc.json` after you log in to Clasp (see the [Clasp section](#clasp)).

In a repository under the `sa-sel` organization, it's only needed to create the `GAS_SCRIPT_ID` repository secret - the other ones are already set up.

## <a id="development"></a> Development

### <a id="directory-structure"></a> Directory Structure

The script's entrypoint is `src/index.ts`, but this file does not contain any code per se - it only exports all of the project's features, so all relevant code will be injected into it in compile time.

The actual code lies inside the directories of `src/`:

- `utils/`: utility components that'll be used in multiple parts of the code (e.g.: functions to add or remove data from sheets, etc)
- `core/`: the actual features (e.g.: `onOpen` function, or a function to be executed in a button)
- `models/`: enums and type objects
- `views/`: all HTML files used for dialogs

Each of those directories has a path alias set (`@utils`, `@core` and `@models`), so you should import using these unless you're in the same directory, in which case you'll use the relative path (`./path/to/module`) in order to avoid circular dependencies.

Whenever you create a new module, you should "re-export" all of it's exports from their directory's `index.ts`. \
\
PS: If you wanna see how all of those files are merged into one, run

```bash
npm run build
```

and see the file `.build/index.js`.

### <a id="formatting"></a> Formatting and Conventions

We're using ESLint for linting and Prettier for autoformatting. Download and configure their extensions for your IDE - e.g.: for VSCode there is [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).

Some other conventions are:

- All code and documentation must be written in english;
- The code must be documented with [TSDoc](https://tsdoc.org/)-style comments;
- Use ES6 syntax;
- All methods, classes, etc must be properly typed (parameters, return values, attributes, ...).

### <a id="commit"></a> Commit Messages

Write commit messages following the following convention:

#### Commit title

The commit message must be written in english and with the following format

```
<type>(<optional scope>) [<ISSUE>] Commit message
```

For example, when working on a task `#7`, you commit the creation of a view that previews an email: `feat(email) #7: Create "email preview" view`.

Aside from that, be sure to make use of `git commit --amend` and `--no-edit` when necessary. Write commit message that actually describe (summarize) the changes you made - do not commit stuff like `Fix bug`, `Fix`, `Fix bug 3`, `Fix bug (again)`.

The message's fields are described in detail below. For more reference, see [this style guide](https://www.conventionalcommits.org/en/v1.0.0/) and the [Angular commit message guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit).

This commit message convention will be checked via git hooks.

#### **\<type\>** field

O campo **type** deve ser uma das seguintes opções:

- **build**: changes to the build system or dependencies;
- **chore**: maintenance/technical task that does not necessarily relate to a user story/new feature;
- **ci**: changes to the CI/CD (GitHub actions) config files and scripts;
- **docs**: documentation changes;
- **feat**: a new feature;
- **fix**: a bug fix;
- **perf**: a code change that improves performance;
- **refactor**: a code change that neither fixes a bug nor adds a feature;
- **style**: changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).

#### **(\<scope\>)** field

The scope field is optional and must consist of a noun describing a section of the codebase surrounded by parenthesis, e.g., `fix(parser)`.

#### **\<ISSUE\>** field

It must be the issue code - e.g. `#7`.

#### **Commit message** field

This is the actual message that must summarize the code changes in a short phrase. The message must follow the rules:

- Be capitalized;
- Be in english;
- Use the _imperative present tense_ (e.g. "change" instead of "changed" or "changes");
- No trailing punctuation (period, exclamation, etc);
- Be at most 60 characters long;

### <a id="deploy"></a> Deploying to GAS

In the [Dependencies](#dependencies) section, you linked your local environment to the GAS project. If you ever change the `SCRIPT_ID` and need to re-link, either run `npm install` again or `scripts/setup-clasp.sh`.

To deploy your code to the GAS project after you edited it, simply run:

```bash
npm run push
```

PS: You don't need to deploy to the project's main script - it will be done every time a PR is merged to the `main` branch.

### <a id="workflow"></a> Workflow

1.  Clone the repository
2.  Choose a task you want to work [in the board](https://github.com/sa-sel/)
    - The task must be in the 'To do' column and have no assignees
    - Prioritize tasks with higher priority: enhancement < moderate < important < critical
    - Check if the task has any dependencies and, if so, their dependencies were already closed
3.  Assign the task to yourself and move it to the 'In progress' column
4.  Create a new branch with the format `issue-<ISSUE/TASK_NUMBER>`
5.  Make all your changes in that branch
6.  Merge the `dev` into your branch
    1. `git fetch --all`
    2. `git merge origin main`
    3. Resolve merge conflicts
    4. Use the default merge commit
7.  `git commit` (use default commit message)
    1.  `git push --set-upstream origin issue-<ISSUE/TASK_NUMBER>`
    2.  Make a PR
        - Follow the instructions in the PR template
        - Move the task to the 'In PR' column in the board
    3.  Request the director's review
    4.  Merge your PR only when:
        - It was approved (in code review)
        - All CI checks have succeeded
        - There are no merge conflicts
