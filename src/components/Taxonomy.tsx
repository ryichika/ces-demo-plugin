import { useCallback, useMemo, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { useAtom, useAtomValue } from "jotai";

import { colors, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

import { executeOperator, Operator, OperatorConfig, registerOperator } from "@fiftyone/operators";
import * as fos from "@fiftyone/state";
// import { Button } from "@fiftyone/components";

import httpClient from "@/utils/httpClient";
import { itemsState, selectedTaxonomiesState, itemIdState } from "@/atoms/taxonomyAtom";
import { TaxonomyData, TaxonomyItem, AggregatedResult } from "@/types/type";

import styled from "styled-components";
import _ from "lodash";

const MUI_X_PRODUCTS: TreeViewBaseItem[] = [
  {
    id: "grid",
    label: "Data Grid",
    children: [
      { id: "grid-community", label: "@mui/x-data-grid" },
      { id: "grid-pro", label: "@mui/x-data-grid-pro" },
      { id: "grid-premium", label: "@mui/x-data-grid-premium" },
    ],
  },
  {
    id: "pickers",
    label: "Date and Time Pickers",
    children: [
      { id: "pickers-community", label: "@mui/x-date-pickers" },
      { id: "pickers-pro", label: "@mui/x-date-pickers-pro" },
    ],
  },
  {
    id: "charts",
    label: "Charts",
    children: [{ id: "charts-community", label: "@mui/x-charts" }],
  },
  {
    id: "tree-view",
    label: "Tree View",
    children: [{ id: "tree-view-community", label: "@mui/x-tree-view" }],
  },
];

const Container = styled.div`
  margin: 1em;
  display: flex;
  flex-direction: column;
  row-gap: 0.25em;
`;

async function setTaxonomyData() {
  const formData = new FormData();
  formData.append("startDate", "");
  formData.append("endDate", "");
  formData.append("targetTable", "tag_table_EmbeddedImages_v6_Updated_NT_2");
  const response = await httpClient.post("/v1/SummarizedTaxonomy", formData);

  const sortedData = response.data.sort((a: any, b: any) => {
    const categoryComparison = a.category.localeCompare(b.category);
    if (categoryComparison !== 0) return categoryComparison;

    const taxonomyComparison = a.taxonomy.localeCompare(b.taxonomy);
    if (taxonomyComparison !== 0) return taxonomyComparison;

    return a.tagName.localeCompare(b.tagName);
  });

  // 静的空間データ設定
  setSceneryElements(sortedData);
}

// 静的空間データ
function setSceneryElements(sortedData: any) {
  const [items, setItems] = useAtom(itemsState);
  const [itemId, setItemId] = useAtom(itemIdState);

  const groupedCategoryS1 = _.filter(sortedData, function (data: TaxonomyData) {
    return data.category === "Drivable area";
  });
  
  const resultL1 = createTreeView(groupedCategoryS1);
  console.log("resultL1", resultL1);

  const newItemL1: TaxonomyItem = {
    id: itemId,
    label: "Drivable area",
    count: resultL1.totalCount,
    children: resultL1.result,
    sourceData: {
      category: "Drivable area",
      taxonomy: "",
      tagName: "",
      tagValue: "",
      count: resultL1.totalCount,
    },
  };
  setItemId((prevId) => prevId + 1);
  setItems((prevItems) => [...prevItems, newItemL1]);
}

function createTreeView(groupedCategory: any, category?: string): AggregatedResult {
  const [itemId, setItemId] = useAtom(itemIdState);

  let totalCount = 0;
  let result: TaxonomyItem[] = [];

  // Taxonomyでグループ化 (第1階層)
  const groupedData = _.groupBy<TaxonomyData[]>(groupedCategory, function (data: TaxonomyData) {
    return data.taxonomy;
  });
  Object.getOwnPropertyNames(groupedData).forEach((key, index) => {
    const children = groupedData[key];
    const newItem: TaxonomyItem = {
      id: itemId,
      label: key,
      count: children.reduce((acc: any, cur: any) => acc + cur.count, 0),
      children: [],
      sourceData: {
        category: groupedCategory[0].category,
        taxonomy: key,
        tagName: "",
        tagValue: "",
        count: children.reduce((acc: any, cur: any) => acc + cur.count, 0),
      },
    };
    setItemId((prevId) => prevId + 1);

    // tagNameでグループ化 (第2階層)
    const groupedData2 = _.groupBy(children, function (data: TaxonomyData) {
      return data.tagName;
    });
    Object.getOwnPropertyNames(groupedData2).forEach((key2) => {
      const children2 = groupedData2[key2];
      // tagNameがない場合はノードに追加しない
      // ※ tagNameがない場合はgroupbyによってundefinedという名前のプロパティができる
      if (key2 === "undefined") return;

      newItem.children?.push({
        id: itemId,
        label: key2,
        count: children2.reduce((acc: any, cur: any) => acc + cur.count, 0),
        children: [],
        sourceData: {
          category: groupedCategory[0].category,
          taxonomy: key,
          tagName: key2,
          tagValue: "",
          count: children.reduce((acc: any, cur: any) => acc + cur.count, 0),
        },
      });
      setItemId((prevId) => prevId + 1);

      // tagValueでグループ化 (第3階層)
      const tagValues = _.filter(children2, function (child2: any) {
        return child2.tagName === key2;
      });
      tagValues.forEach((tagValue: any) => {
        // tagValueがない場合はノードに追加しない
        if (!tagValue.hasOwnProperty("tagValue")) return;

        newItem.children![newItem.children!.length - 1].children?.push({
          id: itemId,
          label: tagValue.tagValue,
          count: tagValue.count,
          sourceData: {
            category: tagValue.category,
            taxonomy: tagValue.taxonomy,
            tagName: tagValue.tagName,
            tagValue: tagValue.tagValue,
            count: tagValue.count,
          },
        });
        setItemId((prevId) => prevId + 1);
      });
    });

    result.push(newItem);
    totalCount += newItem.count;
  });

  const aggregatedResult: AggregatedResult = { result, totalCount };

  return aggregatedResult;
}

function Taxonomy() {
  const items = useAtomValue(itemsState);
  const dataset = useRecoilState(fos.dataset) as any;

  useEffect(() => {
    try {
      setTaxonomyData();
    } catch (error) {
      console.error(error);
    }
  });

  // const onClickAlert = useCallback(
  //   () => executeOperator("@voxel51/hello-world/show_alert"),
  //   []
  // );

  return (
    <Container>
      <Typography color={colors.deepOrange[700]}>
        You are viewing the <em>{dataset[0].name}</em> dataset
      </Typography>

      <Box sx={{ minHeight: 352, minWidth: 290 }}>
        <RichTreeView checkboxSelection items={MUI_X_PRODUCTS} />
      </Box>
    </Container>
  );
}

export default Taxonomy;