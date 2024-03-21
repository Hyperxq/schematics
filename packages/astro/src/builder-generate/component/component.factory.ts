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

// name, addSlot
export function componentFactory({ name, addSlot }: { name: string; addSlot: boolean }): Rule {
  return (tree: Tree) => {
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
        name,
        addSlot,
        ...strings,
      }),
      renameTemplateFiles(),
      move(basePath),
    ]);
    return mergeWith(template, MergeStrategy.Overwrite);
  };
}
