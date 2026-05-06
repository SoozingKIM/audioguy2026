import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list().title("콘텐츠").items([...S.documentTypeListItems()]);
