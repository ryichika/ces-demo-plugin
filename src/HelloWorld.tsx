import { Button } from "@fiftyone/components";
import {
  executeOperator,
  Operator,
  OperatorConfig,
  registerOperator,
} from "@fiftyone/operators";
import * as fos from "@fiftyone/state";
import { colors, Typography } from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import _ from "lodash";
import { useCallback, useMemo } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";

const Container = styled.div`
  margin: 1em;
  display: flex;
  flex-direction: column;
  row-gap: 0.25em;
`;

export function HelloWorld() {
  const onClickAlert = useCallback(
    () => executeOperator("@voxel51/hello-world/show_alert"),
    []
  );
  const dataset = useRecoilValue(fos.dataset);

  const concatResult = useMemo(() => {
    const caption = _.concat(["Life gave us lemons,"], "so we concat 🍋").join(
      " "
    );
    return caption;
  }, []);

  return (
    <Container>
      <Typography variant="h3" color={colors.blueGrey[500]}>
        Hello, world!
      </Typography>
      <Typography color={colors.deepOrange[700]}>
        You are viewing the <em>{dataset?.name}</em> dataset
      </Typography>
      <Typography variant="caption">{concatResult}</Typography>
      <Button onClick={onClickAlert} style={{ width: "200px" }}>
        Show alert
      </Button>

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
    </Container>
  );
}

class AlertOperator extends Operator {
  get config() {
    return new OperatorConfig({
      name: "show_alert",
      label: "Show alert",
      unlisted: true,
    });
  }
  async execute() {
    alert(`Hello from plugin ${this.pluginName}`);
  }
}

registerOperator(AlertOperator, "@voxel51/hello-world");
