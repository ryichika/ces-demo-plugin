// react
import React, { useCallback, useMemo, useEffect, useState, forwardRef, SyntheticEvent } from "react";
import { colors, Typography, Button } from "@mui/material";
import { TreeItem2, TreeItem2Props, TreeItem2SlotProps } from "@mui/x-tree-view/TreeItem2";
import { useTreeItem2Utils } from "@mui/x-tree-view/hooks";

interface CustomLabelProps {
  children: string;
  className: string;
  count: number;
}

function CustomLabel({ children, className, count }: CustomLabelProps & TreeItem2Props) {
  return (
    <div className={className} style={{ position: "relative", width: "100%" }}>
      <Typography>{children}</Typography>
      {count && (
        <div
          style={{
            position: "absolute",
            right: "10px",
            bottom: "2px",
            width: "fit-content",
            backgroundColor: "orange",
            textAlign: "center",
            padding: "0 5px",
          }}
        >
          <Typography color="black">{count}</Typography>
        </div>
      )}
    </div>
  );
}

const CustomCheckbox = forwardRef(function CustomCheckbox(
  props: React.InputHTMLAttributes<HTMLInputElement>,
  ref: React.Ref<HTMLInputElement>,
) {
  return <input type="checkbox" ref={ref} {...props} />;
});

const CustomTreeItem = forwardRef(function CustomTreeItem(
  props: TreeItem2Props,
  ref: React.Ref<HTMLLIElement>
) {
  const { publicAPI } = useTreeItem2Utils({
    itemId: props.itemId,
    children: props.children,
  });

  const item = publicAPI.getItem(props.itemId);

  return (
    <TreeItem2
      {...props}
      ref={ref}
      slots={{
        label: CustomLabel,
        checkbox: CustomCheckbox,
      }}
      slotProps={{
        label: { count: item?.count || 0 } as CustomLabelProps,          
      }}
    />
  );
});

export { CustomTreeItem };