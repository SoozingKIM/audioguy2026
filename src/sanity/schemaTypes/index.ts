import { type SchemaTypeDefinition } from "sanity";

import { discographyEntryType } from "./discographyEntry";
import { imageSlotType } from "./imageSlot";
import { pageSingletonTypes } from "./pageSingletons";
import { siteSettingsType } from "./siteSettings";
import { workScopeType } from "./workScope";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    siteSettingsType,
    imageSlotType,
    ...pageSingletonTypes,
    discographyEntryType,
    workScopeType,
  ],
};
