import {
  Rule,
  Tree,
  apply,
  filter,
  renameTemplateFiles,
  strings,
  url,
  applyTemplates,
  move,
  MergeStrategy,
  chain,
  mergeWith,
} from '@angular-devkit/schematics';
import { NodeDependencyType, addPackageJsonDependency, addScriptToPackageJson } from '../../../../../utils';

export function schematicsLibraryBundler({ bundler }: { bundler: 'rollup' | 'ts' | 'ng-packagr' }) {
  return (tree: Tree) => {
    const bundlerFactory = {
      rollup: implementRollup(),
      ts: implementTs(),
      'ng-packagr': implementNgPackagr(),
    };

    return chain([bundlerFactory[bundler] ?? implementRollup()]);
  };
}

function implementRollup(): Rule {
  return (tree: Tree) => {
    addRollupDependecies(tree);

    const urlTemplates = ['rollup.config.js.template', 'watch-mode.js.template'];
    const template = apply(url('./files/rollup'), [
      filter((path) => urlTemplates.some((template) => path.includes(template))),
      applyTemplates({
        ...strings,
      }),
      renameTemplateFiles(),
      move('./'),
    ]);

    return chain([
      mergeWith(template, MergeStrategy.Overwrite),
      addScriptToPackageJson('build:watch', 'rollup -c --bundleConfigAsCjs --watch'),
      addScriptToPackageJson('build', 'rollup -c --bundleConfigAsCjs'),
    ] as Iterable<Rule>);
  };
}

function implementTs(): Rule {
  /**
   * 1. Install dependecies
   * 2. Create files
   * 3. Update package.json
   * 4. Update tsconfig.json
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return () => {};
}

function implementNgPackagr(): Rule {
  /**
   * 1. Install dependecies
   * 2. Create files
   * 3. Update package.json
   * 4. Update tsconfig.json
   */

  return () => {};
}

function addRollupDependecies(tree: Tree) {
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'glob',
    version: '^10.3.10',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'rollup',
    version: '3.29.4',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: '@rollup/plugin-alias',
    version: '^5.1.0',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: '@rollup/plugin-swc',
    version: '^0.3.0',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: '@rollup/plugin-node-resolve',
    version: '^15.2.3',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'rollup-plugin-copy',
    version: '^3.5.0',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'rollup-plugin-cleaner',
    version: '^1.0.0',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'rollup-plugin-peer-deps-external',
    version: '^2.2.4',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'rollup-plugin-dts',
    version: '^6.1.0',
    overwrite: true,
  });
  addPackageJsonDependency(tree, {
    type: NodeDependencyType.Dev,
    name: 'rollup-plugin-tsconfig-paths',
    version: '^1.5.2',
    overwrite: true,
  });
}
