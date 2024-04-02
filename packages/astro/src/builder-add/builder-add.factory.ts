import { Rule, SchematicContext, Tree, noop } from '@angular-devkit/schematics';
import { NodeDependencyType, addPackageJsonDependency, installDependencies } from '../utils';

export function addFactory({ installCli, packageManager }: { installCli: boolean; packageManager: string }): Rule {
  return () => {
    return installCli ? installCliDev(packageManager) : noop();
  };
}

function installCliDev(packageManager: string): Rule {
  return (tree: Tree, context: SchematicContext) => {
    addPackageJsonDependency(tree, {
      type: NodeDependencyType.Dev,
      name: '@pbuilder/astro-cli',
      version: '1.0.0',
      overwrite: true,
    });

    return installDependencies(context, packageManager);
  };
}
