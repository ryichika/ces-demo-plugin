import fiftyone as fo
import fiftyone.operators as foo
import fiftyone.operators.types as types
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os


class CountSamples(foo.Operator):
    @property
    def config(self):
        return foo.OperatorConfig(
            name="count_samples",
            label="Count samples",
            dynamic=True,
        )

    def resolve_input(self, ctx):
        inputs = types.Object()

        if ctx.view != ctx.dataset.view():
            choices = types.RadioGroup()
            choices.add_choice(
                "DATASET",
                label="Dataset",
                description="Count the number of samples in the dataset",
            )

            choices.add_choice(
                "VIEW",
                label="Current view",
                description="Count the number of samples in the current view",
            )

            inputs.enum(
                "target",
                choices.values(),
                required=True,
                default="VIEW",
                view=choices,
            )

        return types.Property(inputs, view=types.View(label="Count samples"))

    def execute(self, ctx):
        print("Executing count_samples")
        target = ctx.params.get("target", "DATASET")
        sample_collection = ctx.view if target == "VIEW" else ctx.dataset
        return {"count": sample_collection.count()}

    def resolve_output(self, ctx):
        target = ctx.params.get("target", "DATASET")
        outputs = types.Object()
        outputs.int(
            "count",
            label=f"Number of samples in the current {target.lower()}",
        )
        return types.Property(outputs)

class HelloWorldPanel(foo.Panel):
    selected_ids = []
    selected_filepaths = []
 
    @property
    def config(self):
        return foo.PanelConfig(
            name="hello_world_panel",
            label="Hello World Panel"
        )

    def on_load(self, ctx):
        ctx.panel.state.hello_message = "Hello world!!!"

    def say_hello(self, ctx):
        ctx.ops.notify(ctx.panel.state.hello_message)

        sample1 = fo.Sample(
            filepath="/home/ichikawa/ces/001281.jpg",
            ground_truth=fo.Detections(
                detections=[
                    fo.Detection(
                        label="cat",
                        bounding_box=[0.1, 0.1, 0.4, 0.4],
                        foo="bar",
                        hello=True,
                    ),
                    fo.Detection(
                        label="dog",
                        bounding_box=[0.5, 0.5, 0.4, 0.4],
                        hello=None,
                    )
                ]
            )
        )   
        ctx.dataset.add_samples([sample1])

    def onClickSelected(self, ctx):
        selected_ids = ctx.selected
        dataset = ctx.dataset
        view = dataset.view()

        blob_service_client = BlobServiceClient.from_connection_string(
            "DefaultEndpointsProtocol=https;AccountName=stm2studiodev;AccountKey=JAjGToHDsVP/9DXiNzLZOC5V51fnoqLlTg8bNGqHovmbAtVj1hF4vIpFjn3lBO7jUnNDT4dhjT7HdoYVli19zw==;EndpointSuffix=core.windows.net"
        )
        container_client = blob_service_client.get_container_client("selected-images")
        with open('/home/ichikawa/ces/selected-images.txt', 'w') as file:
            filepaths_str = ""
            for id in selected_ids:
                target = view[id]
                if os.path.isfile(target.filepath):
                    blob_name = os.path.basename(target.filepath)
                    blob_client = container_client.get_blob_client(blob_name)
                    with open(target.filepath, "rb") as data:
                        blob_client.upload_blob(data)
                        file.write(f"Uploaded {target.filepath} to {blob_name}" + '\n')     
                file.write(target.filepath + '\n')           
            
    def onClickExport(self, ctx):
        pass                     

    def render(self, ctx):
        panel = types.Object()

        v_stack = panel.v_stack("v_stack", align_x="center", gap=2)
        h_stack = v_stack.h_stack("h_stack", align_y="center")
        h_stack.btn(
            "export_selected_images",
            label="Export selected Images",
            icon="add",
            on_click=self.onClickSelected,
            variant="contained",
        )
        # h_stack.btn(
        #     "export_selected_images",
        #     label="Export selected Images",
        #     icon="remove",
        #     on_click=self.onClickExport,
        #     variant="contained",
        # )

        return types.Property(panel)
    

def register(p):
    p.register(CountSamples)
    p.register(HelloWorldPanel)
