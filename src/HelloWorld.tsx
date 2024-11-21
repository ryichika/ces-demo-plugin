import { Button } from "@fiftyone/components";
import { executeOperator, registerOperator } from "@fiftyone/operators";
import * as fos from "@fiftyone/state";
import { useCallback, useMemo } from "react";
import { useRecoilValue } from "recoil";
import { AlertOperator } from "./operators/AlertOperator";

import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

import styled from "styled-components";

const Container = styled.div`
  margin: 1em;
  display: flex;
  flex-direction: column;
  row-gap: 0.25em;
`;

export function HelloWorld() {
  registerOperator(AlertOperator, "@voxel51/hello-world");
  const onClickAlert = useCallback(() => executeOperator("@voxel51/hello-world/show_alert"), []);
  const dataset: any = useRecoilValue(fos.dataset);

  return (
    <>
      <h1>Hello, world (CES)</h1>
      <h2>
        You are viewing the <strong>{dataset?.name}</strong> dataset
      </h2>
      <Button onClick={onClickAlert}>Show alert</Button>

      {/* TreeView Sample */}
      <SimpleTreeView>
        <TreeItem itemId="grid" label="Data Grid">
          <TreeItem itemId="grid-community" label="@mui/x-data-grid" />
          <TreeItem itemId="grid-pro" label="@mui/x-data-grid-pro" />
          <TreeItem itemId="grid-premium" label="@mui/x-data-grid-premium" />
        </TreeItem>
        <TreeItem itemId="pickers" label="Date and Time Pickers">
          <TreeItem itemId="pickers-community" label="@mui/x-date-pickers" />
          <TreeItem itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
        </TreeItem>
        <TreeItem itemId="charts" label="Charts">
          <TreeItem itemId="charts-community" label="@mui/x-charts" />
        </TreeItem>
        <TreeItem itemId="tree-view" label="Tree View">
          <TreeItem itemId="tree-view-community" label="@mui/x-tree-view" />
        </TreeItem>
      </SimpleTreeView>
    </>

  );
}
