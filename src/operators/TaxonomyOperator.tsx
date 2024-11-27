import { Operator, OperatorConfig, registerOperator } from "@fiftyone/operators";

import { TaxonomyData, TaxonomyItem, AggregatedResult } from "@/types/type";
import httpClient from "@/utils/httpClient";
import _ from "lodash";

export class TaxonomyOperator extends Operator {
  // 3つツリーで通し番号を振るための変数
  globalItemId = 0;
  totalItemCount = 0;

  parentCssText = `
    text-align: center;
    width: 70px;
    height:20px;
    font-size: 14px;
    font-weight: bold;
    color: black;
    background-color: orange;
    position: absolute;
    top: 15px;
    left: 75%;`;

  childCssText = `
    text-align: center;
    min-width: 35px;
    max-width: 70px;
    height:20px;
    font-size: 14px;
    font-weight: bold;
    color: black;
    background-color: #fcd299;
    position: absolute;
    top: 15px;
    left: 75%;`;

  get config() {
    return new OperatorConfig({
      name: "create_taxonomy",
      label: "Create Taxonomy",
      unlisted: true,
    });
  }

  async execute(ctx: any) {
    let items1 = ctx.params.items1;
    let items2 = ctx.params.items2;
    let items3 = ctx.params.items3;
    await this.setTaxonomyData(items1, items2, items3);
  }

  async setTaxonomyData(items1: TaxonomyItem[], items2: TaxonomyItem[], items3: TaxonomyItem[]) {
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
    this.setSceneryElements(sortedData, items1);
    // 環境情報データ
    this.setEnvironmentalCondition(sortedData, items2);
    // 動的データ
    this.setDynamicElements(sortedData, items3);
  }

  // 静的空間データ
  setSceneryElements(sortedData: any, items: TaxonomyItem[]) {
    const groupedCategoryS1 = _.filter(sortedData, function (data: TaxonomyData) {
      return data.category === "Drivable area";
    });
    const resultL1 = this.createTreeView(groupedCategoryS1);
    const newItemL1: TaxonomyItem = {
      id: this.globalItemId.toString(),
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
    this.globalItemId++;
    items.push(newItemL1);
  }

  // 環境情報データ
  setEnvironmentalCondition(sortedData: any, items: TaxonomyItem[]) {
    const groupedCategoryE1 = _.filter(sortedData, function (data: TaxonomyData) {
      return data.category === "Weather";
    });
    const resultE1 = this.createTreeView(groupedCategoryE1);
    const newItemE1: TaxonomyItem = {
      id: this.globalItemId.toString(),
      label: "Weather",
      count: resultE1.totalCount,
      children: resultE1.result,
      sourceData: {
        category: "Weather",
        taxonomy: "",
        tagName: "",
        tagValue: "",
        count: resultE1.totalCount,
      },
    };
    this.globalItemId++;
    items.push(newItemE1);

    const groupedCategoryE2 = _.filter(sortedData, function (data: TaxonomyData) {
      return data.category === "Illumination";
    });
    const resultE2 = this.createTreeView(groupedCategoryE2);
    const newItemE2: TaxonomyItem = {
      id: this.globalItemId.toString(),
      label: "Illumination",
      count: resultE2.totalCount,
      children: resultE2.result,
      sourceData: {
        category: "Illumination",
        taxonomy: "",
        tagName: "",
        tagValue: "",
        count: resultE2.totalCount,
      },
    };
    this.globalItemId++;
    items.push(newItemE2);
  }

  // 動的データ
  setDynamicElements(sortedData: any, items: TaxonomyItem[]) {
    const groupedCategoryD1 = _.filter(sortedData, function (data: TaxonomyData) {
      return data.category === "Vehicle/bike";
    });
    const resultD1 = this.createTreeView(groupedCategoryD1);
    const newItemD1: TaxonomyItem = {
      id: this.globalItemId.toString(),
      label: "Vehicle/bike",
      count: resultD1.totalCount,
      children: resultD1.result,
      sourceData: {
        category: "Vehicle/bike",
        taxonomy: "",
        tagName: "",
        tagValue: "",
        count: resultD1.totalCount,
      },
    };
    this.globalItemId++;
    items.push(newItemD1);

    const groupedCategoryD2 = _.filter(sortedData, function (data: TaxonomyData) {
      return data.category === "Special vehicles";
    });
    const resultD2 = this.createTreeView(groupedCategoryD2);
    const newItemD2: TaxonomyItem = {
      id: this.globalItemId.toString(),
      label: "Special vehicles",
      count: resultD2.totalCount,
      children: resultD2.result,
      sourceData: {
        category: "Special vehicles",
        taxonomy: "",
        tagName: "",
        tagValue: "",
        count: resultD2.totalCount,
      },
    };
    this.globalItemId++;
    items.push(newItemD2);

    const groupedCategoryD3 = _.filter(sortedData, function (data: TaxonomyData) {
      return data.category === "Pedestrian/cyclist";
    });
    const resultD3 = this.createTreeView(groupedCategoryD3);
    const newItemD3: TaxonomyItem = {
      id: this.globalItemId.toString(),
      label: "Pedestrian/cyclist",
      count: resultD3.totalCount,
      children: resultD3.result,
      sourceData: {
        category: "Pedestrian/cyclist",
        taxonomy: "",
        tagName: "",
        tagValue: "",
        count: resultD3.totalCount,
      },
    };
    this.globalItemId++;
    items.push(newItemD3);

    const groupedCategoryD4 = _.filter(sortedData, function (data: TaxonomyData) {
      return data.category === "Other";
    });
    const resultD4 = this.createTreeView(groupedCategoryD4);
    const newItemD4: TaxonomyItem = {
      id: this.globalItemId.toString(),
      label: "Other",
      count: resultD4.totalCount,
      children: resultD4.result,
      sourceData: {
        category: "Other",
        taxonomy: "",
        tagName: "",
        tagValue: "",
        count: resultD4.totalCount,
      },
    };
    this.globalItemId++;
    items.push(newItemD4);

    // imageSearchStore.cachedTaxonomies3 = items3.value;
  }

  createTreeView(groupedCategory: any, category?: string): AggregatedResult {
    let totalCount = 0;
    let result: TaxonomyItem[] = [];

    // Taxonomyでグループ化 (第1階層)
    const groupedData = _.groupBy<TaxonomyData[]>(groupedCategory, function (data: TaxonomyData) {
      return data.taxonomy;
    });
    Object.getOwnPropertyNames(groupedData).forEach((key, index) => {
      const children = groupedData[key];
      const newItem: TaxonomyItem = {
        id: this.globalItemId.toString(),
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
      this.globalItemId++;

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
          id: this.globalItemId.toString(),
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
        this.globalItemId++;

        // tagValueでグループ化 (第3階層)
        const tagValues = _.filter(children2, function (child2: any) {
          return child2.tagName === key2;
        });
        tagValues.forEach((tagValue: any) => {
          // tagValueがない場合はノードに追加しない
          if (!tagValue.hasOwnProperty("tagValue")) return;

          newItem.children![newItem.children!.length - 1].children?.push({
            id: this.globalItemId.toString(),
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
          this.globalItemId++;
        });
      });

      result.push(newItem);
      totalCount += newItem.count;
    });

    const aggregatedResult: AggregatedResult = { result, totalCount };

    return aggregatedResult;
  }
}
