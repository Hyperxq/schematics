export interface SchematicCollection {
  $schema: string;
  schematics: Schematics;
}

export interface Schematics {
  [key: string]: Schematic;
}

export interface Schematic {
  description: string;
  factory: string;
  hidden?: boolean;
  schema?: string;
  aliases?: string[];
  schematicName?: string;
}
