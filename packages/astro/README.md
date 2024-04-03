# Schematics for astro

Astro Schematics streamlines your development workflow by automating routine tasks. Easily create components, layouts, and pages with our tools, supercharged by Project Builder.

To integrate this powerful toolkit into your Astro project, execute:

```sh
npx @pbuilder/cli add @pbuilder/astro
```

## Important Notes

* **CLI Installation:** Running the command above might prompt you to install the CLI. This is highly recommended as the CLI significantly simplifies the creation process for components, layouts, and pages beyond the capabilities of the generic `@pbuilder/cli`.

* **Discoverability:** For detailed command options, append `--help` to learn about all the available parameters and flags.

## Quickstart Guides

### Creating Components

To generate a new component, use:

```sh
pastro g c <component-name>
```

Or, for a direct approach:

```sh
npx @pbuilder/astro-cli g c <component-name>
```

## Create layouts

Generate a new layout by running:

```sh
pastro g l <layout-name>
```

Alternatively:

```sh
npx @pbuilder/astro-cli g l <layout-name>
```

## Create Pages

For page creation, specify the type and layout:

```sh
pastro g p <page-name> --type [md, mdx, astro] --layout <layout file name>
```

Or use the direct method:

```sh
npx @pbuilder/astro-cli g p <page-name> --type [md, mdx, astro] --layout <layout file name>
```

## Beyond the CLI

## Utilizing Generic Schematics

For projects that don't directly utilize `pastro` CLI, the `pbuilder` CLI remains versatile across different JavaScript environments:

```sh
npx @pbuilder/cli exec @pbuilder/astro <schematic-name> --name=<name> [options]
```

For instance, to create a component:

```sh
npx @pbuilder/cli exec @pbuilder/astro c --name=MyComponent2
```
