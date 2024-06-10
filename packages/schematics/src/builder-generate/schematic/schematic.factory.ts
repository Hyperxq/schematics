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
import { Schematic, SchematicCollection } from './schematic.interfaces';
import { logger } from '../../../../../utils/logger';

export function schematicFactory({
  name,
  title,
  skipSchema,
  description,
  schematicsFolder = 'builder-generate',
  collectionRoot = 'src',
}: {
  name: string;
  description: string;
  skipSchema: boolean;
  collectionRoot: string;
  schematicsFolder: string;
  title?: string;
}): Rule {
  return (tree: Tree) => {
    const collectionPath = `/${collectionRoot ?? 'src'}/collection.json`;
    return chain([
      addSchematicFiles(name, title, skipSchema, collectionRoot, schematicsFolder),
      createFilesFolder(name, collectionRoot, schematicsFolder),
      modifyCollection(tree, collectionRoot, schematicsFolder, name, description, skipSchema),
    ]);
  };
}

function addSchematicFiles(
  name: string,
  title: string,
  skipSchema: boolean,
  collectionPath: string,
  schematicsFolder: string,
) {
  const urlTemplates = ['__name@dasherize__.factory.ts.template'];
  if (!skipSchema) {
    urlTemplates.push('schema.json.template');
  }
  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
    applyTemplates({
      ...strings,
      name,
      title,
    }),
    renameTemplateFiles(),
    move(`./${collectionPath}/${schematicsFolder}/${strings.dasherize(name)}`),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}

function createFilesFolder(name: string, collectionPath: string, schematicsFolder: string) {
  const urlTemplates = ['.gitkeep.template'];
  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
    renameTemplateFiles(),
    move(`./${collectionPath}/${schematicsFolder}/${strings.dasherize(name)}/files`),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}

function modifyCollection(
  tree: Tree,
  collectionRoot: string,
  schematicsFolder: string,
  name: string,
  description: string,
  skipSchema: boolean,
) {
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
    description,
    factory: `./${schematicsFolder}/${strings.dasherize(name)}/${strings.dasherize(name)}.factory#${strings.camelize(name)}Factory`,
  };

  if (!skipSchema) {
    schematic.schema = `./${schematicsFolder}/${strings.dasherize(name)}/schema.json`;
  }

  collection.schematics[strings.dasherize(name)] = schematic;

  tree.overwrite(collectionPath, JSON.stringify(collection, null, 2));

  return noop();
}
