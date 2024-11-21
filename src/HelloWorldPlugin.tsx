import { PluginComponentType, registerComponent } from "@fiftyone/plugins";
import { HelloWorld } from "./HelloWorld";

registerComponent({
  name: "ces_demo_panel",
  label: "Hello world (CES)",
  component: HelloWorld,
  type: PluginComponentType.Panel,
  activator: myActivator,
  panelOptions: {
    surfaces: "grid modal",
  },
});

function myActivator({ dataset }) {
  // Example of activating the plugin in a particular context
  // return dataset.name === 'quickstart'

  return true;
}
