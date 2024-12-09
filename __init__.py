import os
import requests
from urllib.parse import urlparse, unquote
import fiftyone as fo
import fiftyone.operators as foo
import fiftyone.operators.types as types
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient

class RegisterImagesOperator(foo.Operator):
    @property
    def config(self):
        return foo.OperatorConfig(
            name="register_images",
            label="Register images",
            dynamic=True,
        )

    def resolve_input(self, ctx):
        pass

    def execute(self, ctx):     
        # 画像を一時保存する任意のディレクトリパス
        target_directory = "/home/ichikawa/ces/images"
        os.makedirs(target_directory, exist_ok=True)
               
        ctx.dataset.clear()
        # ctx.dataset.delete()
        images = ctx.params.get("images", None)
        new_samples = []
        for image_url in images:
            response = requests.get(image_url)
            if response.status_code == 200:
                parsed_url = urlparse(image_url)
                image_name = os.path.basename(parsed_url.path)
                # URLエンコードされた文字をデコード
                image_name = unquote(image_name)    
                image_path = os.path.join(target_directory, image_name)
                with open(image_path, 'wb') as f:
                    f.write(response.content)
                # ctx.dataset.add_samples([fo.Sample(filepath=image_path)])
                new_samples.append(fo.Sample(filepath=image_path))
            else:
                # with open('/home/ichikawa/ces/failed-images.txt', 'w') as file:
                with open('~/ces/failed-images.txt', 'w') as file:
                    print(f"Failed to download {image_url}")
                    
        ctx.dataset.add_samples(new_samples)

    def resolve_output(self, ctx):
        pass

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
    p.register(RegisterImagesOperator)
    p.register(HelloWorldPanel)
