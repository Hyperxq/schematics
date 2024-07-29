import {
  MergeStrategy,
  Rule,
  Tree,
  apply,
  applyTemplates,
  chain,
  filter,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  schematic,
  strings,
  url,
} from '@angular-devkit/schematics';
import { NodeDependencyType, addPackageJsonDependency, addScriptToPackageJson } from '../../../../../utils';

import * as fs from 'fs';
import * as path from 'path';

export function newFactory({
  name,
  author,
  description,
  bundler,
}: {
  name: string;
  author: string;
  description: string;
  bundler: 'rollup' | 'ts' | 'ng-packagr';
  packageManager: string;
}): Rule {
  return () => {
    //install @pbuilder/sm in dev dependencies.
    return chain([
      addFiles({ name, author, description }),
      schematic('schematics-library-bundler', { bundler }),
      schematic('add-utils', {}),
      addDependencies(),
      addSmDependency(),
      schematic('prettier', {
        gitHooks: true,
        quoteProps: 'preserve',
        singleQuote: true,
        trailingComma: 'all',
        printWidth: 80,
      }),
    ]);
  };
}

function addFiles(options: { name: string; author: string; description: string }) {
  const template = apply(url('./files/src'), [
    filter((path) => ['public_api.ts.template', 'collection.json'].some((template) => path.includes(template))),
    applyTemplates({
      ...strings,
    }),
    renameTemplateFiles(),
    move('./src'),
  ]);

  const rootTemplate = apply(url('./files'), [
    filter((path) =>
      [
        'package.json.template',
        'README.md.template',
        'tsconfig.json.template',
        '.nvmrc.template',
        '.npmignore.template',
        '.gitignore.template',
      ].some((template) => path.includes(template)),
    ),
    applyTemplates({
      ...options,
      ...strings,
    }),
    renameTemplateFiles(),
    move('./'),
  ]);

  const builerAddTemplate = apply(url('./files/src/builder-add'), [
    filter((path) =>
      ['builder-add.factory.ts.template', 'schema.json.template'].some((template) => path.includes(template)),
    ),
    applyTemplates({
      ...strings,
    }),
    renameTemplateFiles(),
    move('./src/builder-add'),
  ]);

  return chain([
    mergeWith(template, MergeStrategy.Overwrite),
    mergeWith(builerAddTemplate, MergeStrategy.Overwrite),
    mergeWith(rootTemplate, MergeStrategy.Overwrite),
  ]);
}

function addSmDependency() {
  return (tree: Tree) => {
    const version = getPackageVersion();
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: '@pbuilder/sm',
      version: version,
      overwrite: true,
    });
    return addScriptToPackageJson('new:schematic', 'builder g @pbuilder/sm sc');
  };
}

function addDependencies() {
  return (tree: Tree) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@angular-devkit/core',
      version: '^17.2.0',
      overwrite: true,
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: '@angular-devkit/schematics',
      version: '^17.2.0',
      overwrite: true,
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Default,
      name: 'typescript',
      version: '~5.3.2',
      overwrite: true,
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: 'jasmine',
      version: '^5.0.0',
      overwrite: true,
    });

    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: '@types/node',
      version: '^18.18.0',
      overwrite: true,
    });
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: '@types/jasmine',
      version: '~5.1.0',
      overwrite: true,
    });
  };
}

function getPackageVersion(): string {
  const packageJsonPath = path.resolve(__dirname, '..', '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.version;
}
