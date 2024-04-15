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
  strings,
  url,
} from '@angular-devkit/schematics';
import { logger } from '../../../../../utils/logger';
import { Schematic, SchematicCollection } from '../schematic/schematic.interfaces';

export function addBuilderAddFactory({ collectionRoot = 'src' }: { collectionRoot: string }): Rule {
  return (tree: Tree) => {
    chain([addSchematicFiles(collectionRoot), modifyCollection(tree, collectionRoot)]);
  };
}

function addSchematicFiles(collectionPath: string) {
  const urlTemplates = ['builder-add.factory.ts.template'];
  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
    applyTemplates({
      ...strings,
    }),
    renameTemplateFiles(),
    move(`./${collectionPath}/builder-add`),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}

function modifyCollection(tree: Tree, collectionRoot: string) {
  const collectionPath = `/${collectionRoot ?? 'src'}/collection.json`;
  if (!tree.exists(collectionPath)) {
    logger.error(`We doesn't find the collection.json`);
    process.exit(1);
  }
  const collection: SchematicCollection = JSON.parse(
    tree.read(collectionPath)?.toString('utf-8'),
  ) as SchematicCollection;

  if (!collection.schematics) {
    collection.schematics = {};
  }

  const schematic: Schematic = {
    description: 'This schematic will be executed when use the command builder add [collection-name]',
    factory: `./builder-add/builder-add.factory#builderAddFactory`,
    schema: `./builder-add/schema.json`,
  };

  collection.schematics['builder-add'] = schematic;

  tree.overwrite(collectionPath, JSON.stringify(collection, null, 2));

  return noop();
}
