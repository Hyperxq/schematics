import { nodeResolve } from '@rollup/plugin-node-resolve';
import tsConfigPaths from 'rollup-plugin-tsconfig-paths';
import alias from '@rollup/plugin-alias';
import cleaner from 'rollup-plugin-cleaner';
import copy from 'rollup-plugin-copy';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import swc from '@rollup/plugin-swc';
import glob from 'glob';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dts } from 'rollup-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basePlugins = [
  tsConfigPaths(),
  peerDepsExternal(),
  nodeResolve({ extensions: ['.ts', '.js', '.json'] }),
  swc({
    include: /\.ts$/,
    jsc: {
      parser: { syntax: 'typescript', tsx: false },
      target: 'es2021',
    },
    module: { type: 'commonjs' },
    tsconfig: path.resolve(__dirname, 'tsconfig.json'),
  }),
];

const baseExternal = [
  'node:module',
  'ansi-colors',
  'ora',
  'inquirer',
  'tty',
  'node-emoji',
  '@angular-devkit/schematics/tasks',
  '@angular-devkit/schematics-cli',
  '@angular-devkit/schematics',
  '@angular-devkit/core',
  'winston',
  'winston-console-format',
  'jsonc-parser',
];
const removeSrcPath = (string) => normalizeUrl(string).replace(/^(src[/\\])(.*?)/gs, '$2');
const normalizeUrl = (url) => url.replace(/\\/g, '/');
const removeSrcPattern = /^(src\/)/;

const tsFilesSrc = glob.sync('src/**/**/**/**/*.ts').filter(file => !file.endsWith('public_api.ts'));

const transformedPaths = tsFilesSrc.reduce((acc, filePath) => {
  const fileName = normalizeUrl(filePath).replace(/\.ts/, '').replace(removeSrcPattern, '')
  acc[fileName] = filePath;
  return acc;
}, {});

export default [
  {
    input: 'src/public_api.ts',
    output: {
      dir: '../../dist/sm',
      format: 'cjs',
      preserveModules: true,
    },
    external: baseExternal,
    plugins: [
      ...basePlugins,
      cleaner({
        targets: ['../../dist/sm'],
      }),
      copy({
        targets: [
          {
            src: 'package.json',
            dest: '../../dist/sm',
            transform: (contents) => {
              const packageData = JSON.parse(contents.toString());
              delete packageData.scripts;
              delete packageData.devDependencies;
              delete packageData.keywords;
              delete packageData.engines;
              return JSON.stringify(packageData, null, 2);
            },
          },
          {
            src: 'README.md',
            dest: '../../dist/sm',
          },
          {
            src: 'src/collection.json',
            dest: '../../dist/sm',
          },
          {
            src: 'src/**/**/*.json',
            dest: '../../dist/sm',
            rename: (name, extension, fullPath) => {
              return removeSrcPath(fullPath);
            },
          },
          {
            src: ['src/**/**/**/**/*.template', 'src/**/**/**/**/.*.template'],
            dest: '../../dist/sm',
            rename: (name, extension, fullPath) => {
              return removeSrcPath(fullPath);
            },
          },
        ],
        hook: 'writeBundle',
      }),
    ],
  },
  {
    input: transformedPaths,
    output: {
      dir: '../../dist/sm',
      format: 'cjs',
      preserveModules: true,
    },
    external: baseExternal,
    plugins: [
      ...basePlugins,
      alias({ entries: [{ find: 'utils', replacement: '../../utils' }] }),
    ],
  },
  {
    input: transformedPaths,
    output: {
      dir: '../../dist/sm',
      format: 'es',
    },
    plugins: [
      dts(),
    ],
  },
];
