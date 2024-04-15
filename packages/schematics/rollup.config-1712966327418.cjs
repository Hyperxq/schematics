'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var pluginNodeResolve = require('@rollup/plugin-node-resolve');
var tsConfigPaths = require('rollup-plugin-tsconfig-paths');
var alias = require('@rollup/plugin-alias');
var glob = require('glob');
var path = require('node:path');
var url = require('url');
var copy = require('rollup-plugin-copy');
var cleaner = require('rollup-plugin-cleaner');
var peerDepsExternal = require('rollup-plugin-peer-deps-external');
var rollupPluginDts = require('rollup-plugin-dts');
var swc = require('@rollup/plugin-swc');

// import typescript from '@rollup/plugin-typescript';

// Convert the import.meta.url to a file path
const __filename$1 = url.fileURLToPath('file:///D:/Projects/Project-Builder%20Repos/schematics/packages/schematics/rollup.config.js');

// Get the directory name from the file path
const __dirname$1 = path.dirname(__filename$1);


function getInputsFromGlob(pattern) {
  return glob.sync(pattern).reduce((inputs, file) => {
    const name = path.basename(file, path.extname(file));
    if (name === 'public_api') return inputs;
    inputs.push(file);
    return inputs;
  }, []);
}

const tsFilesSrc = getInputsFromGlob('src/**/**/**/**/*.ts');
const buildFolderPathPattern = /^(src\/)(.*?)([/][^/]+\.ts)$/gs;
const removeSrcPattern = /^(src[/\\])(.*?)/gs;

const normalizeUrl = (url) => url.replace(/\\/g, '/');
const removeSrcPath = (string) => normalizeUrl(string).replace(removeSrcPattern, '$2');
const removeSrcFileNamePath = (string) =>
  normalizeUrl(string).replace(buildFolderPathPattern, '$2');

const basePlugins = [
  // typescript({ outputToFilesystem: false }),
  tsConfigPaths(),
  peerDepsExternal(),
  pluginNodeResolve.nodeResolve({ extensions: [".ts",".js", ".json"] }),
  swc({
    // SWC configuration
    include: /\.ts?$/,
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: false,
      },
      baseUrl: '.',
      target: 'ES2021',
    },
    module: {
      type: 'commonjs',
    },
    tsconfig: path.resolve(__dirname$1, 'tsconfig.json'),
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
  'winston-console-format'
];

var rollup_config = [
  {
    input: 'src/public_api.ts',
    output: [
      {
        dir: '../../dist/sm',
        format: 'cjs',
        preserveModules: true,
      },
    ],
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
  ...tsFilesSrc.map((file) => ({
    input: file,
    output: {
      dir: `../../dist/sm/${removeSrcFileNamePath(file)}`,
      format: 'cjs',
      exports: 'auto',
    },
    plugins: [...basePlugins,
      alias({
        entries: [
          { find: 'utils', replacement: '../../utils' }
        ]
      })
    ],
    external: baseExternal,
  })),

  ...tsFilesSrc.map((file) => ({
    input: file,
    output: {
      dir: `../../dist/sm/${removeSrcFileNamePath(file)}`,
    },
    plugins: [rollupPluginDts.dts()],
  })),
];

exports.default = rollup_config;
