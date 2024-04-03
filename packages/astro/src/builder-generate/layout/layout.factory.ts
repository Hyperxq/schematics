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
import { parseName } from '../../../../../utils';

// name, addSlot
export function layoutFactory({ name }: { name: string }): Rule {
  return (tree: Tree) => {
    const { path, name: layoutName } = parseName('./', name);
    let basePath = './src';

    if (!tree.getDir('/').subdirs.find((f) => f === 'src')) {
      basePath = './layouts';
    } else {
      basePath = basePath + '/layouts';
    }
    const urlTemplates = ['__name@classify__.astro.template'];
    const template = apply(url('./files'), [
      filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
      applyTemplates({
        name: layoutName,
        ...strings,
      }),
      renameTemplateFiles(),
      move(`${basePath}${path ?? ''}`),
    ]);
    return mergeWith(template, MergeStrategy.Overwrite);
  };
}
