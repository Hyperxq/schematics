# Schematics for astro

These schematics allow you to automate daily task as: Create components, layouts and pages.

This schematics are powered by [Project Builder](https://schematics.pbuilder.dev/)

We recommend to add this library to your astro project:

```sh
npx @pbuilder/cli add @pbuilder/astro
```

## Note

You will notice that the previous command will tell you if you want to install a CLI, the reason is because the CLI will help you to create: components, layouts and pages easier than if you use the generic @pbuilder/cli  CLI.

## Note 2

For any command that you want to know the allowed options you can use the flag: `--help`.

## Create components

```sh
pastro g c <component-name>
```

```sh
npx @pbuilder/astro-cli g c <component-name>
```

## Create layouts

```sh
pastro g l <layout-name>
```

```sh
npx @pbuilder/astro-cli g l <layout-name>
```

## Create Pages

```sh
pastro g p <page-name> --type [md, mdx, astro] --layout <layout file name>
```

```sh
npx @pbuilder/astro-cli g p <page-name> --type [md, mdx, astro] --layout <layout file name>
```

## Using schematics without the pastro cli

You can use the generic cli for schematics named `pbuilder`. The reason is because some schematics no matter the frameworks you can will use them in every Javascript envioriment.

```sh
npx @pbuilder/cli exec @pbuilder/astro <schematic-name(page, component, layout)> --name=<name> [options]
```

For example:

```sh
npx @pbuilder/cli exec @pbuilder/astro c --name=MyComponent2
```
