import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";

import { PAGE_SINGLETONS } from "./schemaTypes/pageSingletons";

const HIDDEN_FROM_DEFAULT_LIST = new Set<string>([
  "siteSettings",
  "discographyEntry",
  "workScope",
  ...PAGE_SINGLETONS.map((p) => p.name),
]);

export const structure: StructureResolver = (S, context) =>
  S.list()
    .id("root")
    .title("콘텐츠")
    .items([
      S.listItem()
        .id("siteSettings")
        .title("사이트 설정")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.divider(),
      S.listItem()
        .id("pageImages")
        .title("페이지 콘텐츠")
        .child(
          S.list()
            .id("pageImagesList")
            .title("페이지 콘텐츠")
            .items(
              PAGE_SINGLETONS.map((p) =>
                S.listItem()
                  .id(p.name)
                  .title(p.title)
                  .child(
                    S.document()
                      .schemaType(p.name)
                      .documentId(p.name),
                  ),
              ),
            ),
        ),
      S.divider(),
      orderableDocumentListDeskItem({
        type: "discographyEntry",
        title: "Discography (drag to reorder)",
        S,
        context,
      }),
      S.documentTypeListItem("workScope")
        .id("workScope")
        .title("작업범위 카테고리"),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_FROM_DEFAULT_LIST.has(item.getId() ?? ""),
      ),
    ]);
