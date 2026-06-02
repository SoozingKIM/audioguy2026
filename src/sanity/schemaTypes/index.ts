import { type SchemaTypeDefinition } from "sanity";

import { communityCacheType } from "./communityCache";
import { discographyEntryType } from "./discographyEntry";
import { imageSlotType } from "./imageSlot";
import { localeStringType, localeTextType } from "./localized";
import { pageSingletonTypes } from "./pageSingletons";
import { siteSettingsType } from "./siteSettings";
import { workScopeType } from "./workScope";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    siteSettingsType,
    imageSlotType,
    localeStringType,
    localeTextType,
    ...pageSingletonTypes,
    discographyEntryType,
    workScopeType,
    communityCacheType,
  ],
};
