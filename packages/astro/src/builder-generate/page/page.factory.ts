import {
  MergeStrategy,
  Rule,
  Tree,
  apply,
  applyTemplates,
  filter,
  mergeWith,
  move,
  renameTemplateFiles,
  url,
} from '@angular-devkit/schematics';
import { logger, parseName } from '../../utils';
import { askLayout } from './page.questions';
import { strings } from '@angular-devkit/schematics';

export function pageFactory({
  name,
  layout,
  type,
}: {
  name: string;
  layout: string;
  type: 'astro' | 'md' | 'mdx';
}): Rule {
  return async (tree: Tree) => {
    const { name: pageName, path } = parseName('./', name);

    // logger.debug(parsedName);
    // Read layouts
    if (!layout) {
      const layoutNames = readLayouts(tree);

      if (layoutNames.length > 0) {
        layout = await askLayout(layoutNames.map((x) => strings.classify(x)));
      }

      if (layout === 'none') {
        layout = undefined;
      }
    } else {
      const layouts = tree.getDir('./src/layouts').subfiles;
      layout = strings.classify(layout);
      if (!layouts.find((x) => x === `${layout}.astro`)) {
        logger.error(`The layout ${layout} doesn't exist`);
        process.exit(1);
      }
    }

    // If choose any layout depends how deep wil the page will be needs to have the relative path from page to layout
    const relativePathLayout = getRelativeLayoutPath(layout, path);

    // Support Files type
    // The page named can has a folders

    return addPageFile(type, relativePathLayout, layout, pageName, path);
  };
}

function getRelativeLayoutPath(layoutName: string, pagePath: string) {
  const foldersBackCount = pagePath.split('/').filter((x) => x).length + 1;
  return `${new Array(foldersBackCount).fill('..').join('/')}/layouts/${layoutName}.astro`;
}

function readLayouts(tree: Tree): string[] {
  const layouts: string[] = [];
  const layoutsDirectoryPath = './src/layouts';

  if (tree.getDir(layoutsDirectoryPath).subfiles.length === 0) {
    return layouts;
  }

  return tree.getDir(layoutsDirectoryPath).subfiles.map((x) => x.replaceAll('.astro', ''));

  //TODO: support layouts in subfolders
  // layoutFiles.forEach((file) => {
  // const filePath = `${layoutsDirectoryPath}/${file}`;
  // const content = tree.read(filePath);
  // if (content) {
  //   // You can now do something with the content, like parsing it
  //   logger.debug(content.toString('utf-8'));
  // }
  // });
}

function addPageFile(
  fileType: 'astro' | 'md' | 'mdx',
  relativeLayoutPath: string,
  layoutName: string,
  pageName: string,
  pagePath: string,
): Rule {
  let basePath = './src/pages';

  // if (!tree.getDir('/').subdirs.find((f) => f === 'src')) {
  //   basePath = './pages';
  // } else {
  //   basePath = basePath + '/pages';
  // }

  const pageTypes = {
    astro: '__name@classify__.astro.template',
    md: '__pageName@classify__.md.template',
    mdx: '__pageName@classify__.mdx.template',
  };

  const urlTemplates = [pageTypes[fileType]];

  const template = apply(url('./files'), [
    filter((path) => urlTemplates.some((urlTemplate) => path.includes(urlTemplate))),
    applyTemplates({
      name: pageName,
      relativeLayoutPath,
      layoutName,
      ...strings,
    }),
    renameTemplateFiles(),
    move(`${basePath}${pagePath}`),
  ]);
  return mergeWith(template, MergeStrategy.Overwrite);
}
