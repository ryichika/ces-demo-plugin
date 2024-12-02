import { Operator, OperatorConfig, registerOperator } from "@fiftyone/operators";

import httpClient from "@/utils/httpClient";
import _ from "lodash";

export class SearchOperator extends Operator {

  get config() {
    return new OperatorConfig({
      name: "search_images",
      label: "Search Image",
      unlisted: true,
    });
  }

  async execute(ctx: any) {
    
  }
}
