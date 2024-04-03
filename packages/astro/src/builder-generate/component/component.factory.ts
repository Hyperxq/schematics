import { parseName } from '../../../../../utils';
import {
  Rule,
  apply,
  url,
  filter,
  applyTemplates,
  strings,
  renameTemplateFiles,
  move,
  mergeWith,
  MergeStrategy,
  Tree,
} from '@angular-devkit/schematics';

export function componentFactory({ name, addSlot }: { name: string; addSlot: boolean }): Rule {
  return (tree: Tree) => {
    const { path, name: componentName } = parseName('./', name);

    let basePath = './src';

    if (!tree.getDir('/').subdirs.find((f) => f === 'src')) {
      basePath = './components';
    } else {
      basePath = basePath + '/components';
    }
    const urlTemplates = ['__name@classify__.astro.template'];
    const template = apply(url('./files'), [
      filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
      applyTemplates({
        name: componentName,
        addSlot,
        ...strings,
      }),
      renameTemplateFiles(),
      move(`${basePath}${path ?? ''}`),
    ]);
    return mergeWith(template, MergeStrategy.Overwrite);
  };
}
