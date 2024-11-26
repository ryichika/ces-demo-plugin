import { useCallback, useMemo, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { useAtom, useAtomValue } from "jotai";

import { colors, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";

import { registerOperator, useOperatorExecutor } from "@fiftyone/operators";
import { TaxonomyOperator } from "@/operators/TaxonomyOperator";

import * as fos from "@fiftyone/state";
// import { Button } from "@fiftyone/components";

// import { itemsState, selectedTaxonomiesState, globalItemIdState } from "@/atoms/taxonomyAtom";
import { TaxonomyData, TaxonomyItem, AggregatedResult } from "@/types/type";

import styled from "styled-components";
import style from "./style.module.css";
import _ from "lodash";

function Taxonomy() {
  const [treeItems1, settreeItems1] = useState([] as TaxonomyItem[]);
  const [treeItems2, settreeItems2] = useState([] as TaxonomyItem[]);
  const [treeItems3, settreeItems3] = useState([] as TaxonomyItem[]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const executor = useOperatorExecutor("@voxel51/taxonomy_plugin/create_taxonomy");
  // const dataset = useRecoilState(fos.dataset) as any;

  const Container = styled.div`
    padding: 20px 0;
    display: flex;
    justify-content: center;
  `;

  const DetailPanelContent = styled.div`
    overflow-y: auto;
    overflow-x: hidden;
    color: #c0c0c0;
    margin-bottom: 20px;
    height: 100%;
    width: 90%;
  `;

  const DetailPanelContentTree = styled.div`
    position: relative;
  `;

  const DetailPanelContentTreeBoxHeader = styled.div`
    font-size: 1.1rem;
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
    border-bottom: 1px solid #c0c0c0;
  `;

  const DetailPanelContentTreeBoxes = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    overflow-y: hidden;
  `;

  const DetailPanelContentTreeBox = styled.div`
    width: 32.8%;
    overflow-y: hidden;
    height: calc(100vh - 320px);
  `;

  useEffect(() => {
    const fetchData = async () => {
      let items1 = [] as TaxonomyItem[];
      let items2 = [] as TaxonomyItem[];
      let items3 = [] as TaxonomyItem[];
      await executor.execute({ items1, items2, items3 });

      settreeItems1(items1);
      settreeItems2(items2);
      settreeItems3(items3);
      console.log(style);
    };

    fetchData();
  }, []);

  const handleSelectedItemsChange = (event: React.SyntheticEvent, ids: string[]) => {
    console.log(ids);
  };

  return (
    <Container>
      <DetailPanelContent>
        <DetailPanelContentTree>
          <DetailPanelContentTreeBoxHeader
            style={{
              width: "200px",
              margin: "0 auto",
              textAlign: "center",
              paddingTop: "2px",
              border: "1px solid #c0c0c0",
            }}
          >
            Driving Situation
          </DetailPanelContentTreeBoxHeader>
          <div
            style={{ borderLeft: "1px solid #c0c0c0", height: "28px", position: "absolute", left: "50%", top: "29px" }}
          ></div>
          <div
            style={{ borderLeft: "1px solid #c0c0c0", height: "14px", position: "absolute", left: "16%", top: "40px" }}
          ></div>
          <div
            style={{ borderLeft: "1px solid #c0c0c0", height: "14px", position: "absolute", left: "84%", top: "40px" }}
          ></div>
          <div
            style={{
              borderBottom: "1px solid white",
              height: "1px",
              width: "34%",
              position: "absolute",
              left: "16%",
              top: "40px",
            }}
          ></div>
          <div
            style={{
              borderBottom: "1px solid white",
              height: "1px",
              width: "34%",
              position: "absolute",
              left: "50%",
              top: "40px",
            }}
          ></div>
          <DetailPanelContentTreeBoxes>
            <DetailPanelContentTreeBox>
              <DetailPanelContentTreeBoxHeader>Scenery Elements</DetailPanelContentTreeBoxHeader>
              {treeItems1.length && (
                <RichTreeView
                  multiSelect
                  checkboxSelection
                  items={treeItems1}
                  onSelectedItemsChange={handleSelectedItemsChange}
                />
              )}
            </DetailPanelContentTreeBox>
            <DetailPanelContentTreeBox>
              <DetailPanelContentTreeBoxHeader>Environmental Condition</DetailPanelContentTreeBoxHeader>
              {treeItems2.length && (
                <RichTreeView
                  multiSelect
                  checkboxSelection
                  items={treeItems2}
                  onSelectedItemsChange={handleSelectedItemsChange}
                />
              )}
            </DetailPanelContentTreeBox>
            <DetailPanelContentTreeBox>
              <DetailPanelContentTreeBoxHeader>Dynamic Elements</DetailPanelContentTreeBoxHeader>
              {treeItems3.length && (
                <RichTreeView
                  multiSelect
                  checkboxSelection
                  items={treeItems3}
                  onSelectedItemsChange={handleSelectedItemsChange}
                />
              )}
            </DetailPanelContentTreeBox>
          </DetailPanelContentTreeBoxes>
        </DetailPanelContentTree>
      </DetailPanelContent>
    </Container>
  );
}

export default Taxonomy;

registerOperator(TaxonomyOperator, "@voxel51/taxonomy_plugin");
