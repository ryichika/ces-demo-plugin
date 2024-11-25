import { PluginComponentType, registerComponent } from "@fiftyone/plugins";
import Taxonomy from "@/components/Taxonomy";

registerComponent({
  name: "taxonomy_tree",
  label: "Taxonomy Tree",
  component: Taxonomy,
  type: PluginComponentType.Panel,
  activator: myActivator,
  panelOptions: {
    surfaces: "grid modal",
  },
});

function myActivator({ dataset }: any) {
  // Example of activating the plugin in a particular context
  // return dataset.name === 'quickstart'

  return true;
}
