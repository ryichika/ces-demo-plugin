import { Operator, OperatorConfig, registerOperator } from "@fiftyone/operators";

export class AlertOperator extends Operator {
  get config() {
    return new OperatorConfig({
      name: "show_alert",
      label: "Show alert",
      unlisted: true,
    });
  }
  
  async execute() {    
    alert(`Ryuta, Hello from plugin ${this.pluginName}`);
  }
}

// registerOperator(AlertOperator, "@voxel51/hello-world");