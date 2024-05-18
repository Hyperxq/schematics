/* eslint-disable no-console */
import {
  apply,
  applyTemplates,
  chain,
  filter,
  MergeStrategy,
  mergeWith,
  move,
  noop,
  renameTemplateFiles,
  Rule,
  schematic,
  SchematicsException,
  strings,
  Tree,
  url,
} from '@angular-devkit/schematics';
import { PrettierConfig } from './prettier.interfaces';
import { addPackageJsonDependency, addScriptToPackageJson, NodeDependencyType } from '../../../../../utils';

export function prettierFactory(options: PrettierConfig) {
  return () => {
    const { version, gitHooks, defaultOptions, packageManager, ...prettierOptions } = options;

    return chain([
      addPrettierFiles(defaultOptions ? {} : prettierOptions),
      gitHooks ? schematic('git-hooks', {}) : noop(),
      addScriptToPackageJson('format', 'prettier --write .'),
      addPrettierDependency(),
    ] as Iterable<Rule>);
  };
}

function addPrettierDependency(): Rule {
  return (tree: Tree) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: 'prettier',
      version: '3.2.5',
      overwrite: true,
    });
  };
}

function addPrettierFiles(
  options: Omit<PrettierConfig, 'version' | 'gitHooks' | 'defaultOptions' | 'packageManager'>,
): Rule {
  const urlTemplates = ['.prettierrc.template', '.prettierignore.template'];
  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((template) => path.includes(template))),
    applyTemplates({
      ...strings,
      options,
    }),
    renameTemplateFiles(),
    move('./'),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}
