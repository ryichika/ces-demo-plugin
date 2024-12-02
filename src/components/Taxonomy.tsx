// react
import React, { useCallback, useMemo, useEffect, useState, SyntheticEvent } from "react";
// recoil
import { useRecoilState, useRecoilValue } from "recoil";
// mui/material
import { colors, Typography, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
// fiftyone
import { registerOperator, useOperatorExecutor } from "@fiftyone/operators";
import { TaxonomyOperator } from "@/operators/TaxonomyOperator";
import * as fos from "@fiftyone/state";
// etc
import { CustomTreeItem } from "./CustomTreeItem";
import { TaxonomyItem } from "@/types/type";
import styled from "styled-components";
import _ from "lodash";

function Taxonomy() {
  const [treeItems1, settreeItems1] = useState([] as TaxonomyItem[]);
  const [treeItems2, settreeItems2] = useState([] as TaxonomyItem[]);
  const [treeItems3, settreeItems3] = useState([] as TaxonomyItem[]);
  // const [expandedItems1, setExpandedItems1] = useState<string[]>([]);
  // const [expandedItems2, setExpandedItems2] = useState<string[]>([]);
  // const [expandedItems3, setExpandedItems3] = useState<string[]>([]);
  const taxonomyExecutor = useOperatorExecutor("@voxel51/taxonomy_plugin/create_taxonomy");
  const searchExecutor = useOperatorExecutor("@voxel51/taxonomy_plugin/count_samples");

  const dataset = useRecoilState(fos.dataset) as any;
  const view = useRecoilValue(fos.view);
  const filters = useRecoilValue(fos.filters);
 
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
    setTimeout(async () => {
      await fetchTaxonomyData();
    }, 10000);
  }, []);

  const fetchTaxonomyData = async () => {
    let items1 = [] as TaxonomyItem[];
    let items2 = [] as TaxonomyItem[];
    let items3 = [] as TaxonomyItem[];
    await taxonomyExecutor.execute({ items1, items2, items3 });

    settreeItems1(items1);
    settreeItems2(items2);
    settreeItems3(items3);
  };

  const onSelectedItemsChange1 = (event: SyntheticEvent, ids: string[]) => {
    const result = _.filter(treeItems1, (item) => ids.includes(item.id.toString()));
  };

  const onSelectedItemsChange2 = (event: SyntheticEvent, ids: string[]) => {
    const result = _.filter(treeItems2, (item) => ids.includes(item.id.toString()));
  };

  const onSelectedItemsChange3 = (event: SyntheticEvent, ids: string[]) => {
    const result = _.filter(treeItems3, (item) => ids.includes(item.id.toString()));
  };

  // Test Code
  const count = searchExecutor.result?.count || -1;
  const onClickCount = () => {
    searchExecutor.execute();
  };

  return (
    <React.StrictMode>
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
              style={{
                borderLeft: "1px solid #c0c0c0",
                height: "28px",
                position: "absolute",
                left: "50%",
                top: "29px",
              }}
            ></div>
            <div
              style={{
                borderLeft: "1px solid #c0c0c0",
                height: "14px",
                position: "absolute",
                left: "16%",
                top: "40px",
              }}
            ></div>
            <div
              style={{
                borderLeft: "1px solid #c0c0c0",
                height: "14px",
                position: "absolute",
                left: "84%",
                top: "40px",
              }}
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
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Scenery Elements</DetailPanelContentTreeBoxHeader>
                {treeItems1.length && (
                  <RichTreeView
                    multiSelect
                    checkboxSelection
                    items={treeItems1}
                    slots={{ item: CustomTreeItem }}
                    onSelectedItemsChange={onSelectedItemsChange1}
                  />
                )}
              </DetailPanelContentTreeBox>
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Environmental Condition</DetailPanelContentTreeBoxHeader>
                {treeItems2.length && (
                  <RichTreeView multiSelect checkboxSelection items={treeItems2} slots={{ item: CustomTreeItem }} onSelectedItemsChange={onSelectedItemsChange2} />
                )}
              </DetailPanelContentTreeBox>
              <DetailPanelContentTreeBox className="detail-panel-content-tree-box">
                <DetailPanelContentTreeBoxHeader>Dynamic Elements</DetailPanelContentTreeBoxHeader>
                {treeItems3.length && (
                  <RichTreeView
                    multiSelect
                    checkboxSelection
                    items={treeItems3}
                    slots={{ item: CustomTreeItem }}
                    onSelectedItemsChange={onSelectedItemsChange3}
                  />
                )}
              </DetailPanelContentTreeBox>
            </DetailPanelContentTreeBoxes>
          </DetailPanelContentTree>
        </DetailPanelContent>
      </Container>
      <p>Database count: {count}</p>
      <Button variant="outlined" endIcon={<SendIcon />} onClick={onClickCount}>
        Count
      </Button>      
    </React.StrictMode>
  );
}

export default Taxonomy;

registerOperator(TaxonomyOperator, "@voxel51/taxonomy_plugin");
