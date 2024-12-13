import os
import requests
from urllib.parse import urlparse
from logging import getLogger, FileHandler, DEBUG, ERROR
import fiftyone as fo
import fiftyone.operators as foo
import fiftyone.operators.types as types
from azure.storage.blob import BlobServiceClient

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
        target_directory = f"{os.environ.get('HOME')}/ces/images"
        os.makedirs(target_directory, exist_ok=True)        
                
        images = ctx.params.get("images", None)
        categories = ctx.params.get("categories", None)
        taxonomies = ctx.params.get("Taxonomies", None)
        if len(images) > 0:
            try:
                ctx.dataset.clear()
                count = 0
                for image_url in images:
                    parsed_url = urlparse(image_url)
                    image_name = os.path.basename(parsed_url.path)
                    image_path = os.path.join(target_directory, image_name)
                    # キャッシュの有無確認
                    if not os.path.exists(image_path):
                        response = requests.get(image_url)
                        if response.status_code == 200:
                            with open(image_path, 'wb') as f:
                                f.write(response.content)
                                
                            sample = fo.Sample(filepath=image_path)
                            # タグ追加
                            sample.tags.append(taxonomies[count])                            
                            # ラベル追加
                            sample["category"] = fo.Classification(label=categories[count])
                            sample["taxonomy"] = fo.Classification(label=taxonomies[count])
                            ctx.dataset.add_samples([sample]) 
                    else:
                        sample = fo.Sample(filepath=image_path)  
                        # タグ追加
                        sample.tags.append(taxonomies[count])
                        # ラベル追加
                        sample["category"] = fo.Classification(label=categories[count])
                        sample["taxonomy"] = fo.Classification(label=taxonomies[count])
                        # バウンディングボックス追加
                        # sample["ground_truth"] = fo.Detections(detections=[fo.Detection(label=Taxonomies[count], bounding_box=[0.5, 0.5, 0.4, 0.3])])
                        ctx.dataset.add_samples([sample])
                    count += 1
                       
                # 画像の登録が完了したら、データセットをリロードする
                ctx.ops.reload_dataset()
                ctx.ops.notify("Images have been updated successfully.")   
            except Exception as e:
                log_exception(str(e))                
                ctx.ops.notify("Failed to update images.")
        else:
            ctx.ops.notify("No images to update.")
          
        return {"isCompleted": 1}

    def resolve_output(self, ctx):
        pass
    
class ReloadDatasetOperator(foo.Operator):
    @property
    def config(self):
        return foo.OperatorConfig(
            name="reload_dataset",
            label="Reload dataset",
            dynamic=True,
        )

    def resolve_input(self, ctx):
        pass

    def execute(self, ctx):        
        ctx.ops.reload_dataset()
        # JS Pluginのshow_messageメソッドを呼び出す
        # self.show_message(ctx)
        
    # JS Pluginのshow_messageメソッドを呼び出す
    def show_message(self, ctx):
        return ctx.trigger(f"@voxel51/taxonomy_plugin/show_message")

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
            filepath=f"{os.environ.get('HOME')}/ces/001281.jpg",
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
        
        if not os.path.isdir(self.target_directory):
            self.target_directory = "/home/Ichikawa"            
            
        with open(F"{self.target_directory}/ces/selected-images.txt", 'w') as file:
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

def log_debug(debug_message):
    logger = getLogger(__name__)
    logger.setLevel(DEBUG)
    handler = FileHandler(f"{os.environ.get('HOME')}/ces/debug.log")
    logger.addHandler(handler)
    logger.info(debug_message)

def log_exception(exception_message):
    logger = getLogger(__name__)
    handler = FileHandler(f"{os.environ.get('HOME')}/ces/error.log")
    handler.setLevel(ERROR)
    logger.addHandler(handler)
    logger.error(str(exception_message))        

def register(p):
    p.register(RegisterImagesOperator)
    p.register(ReloadDatasetOperator)
    p.register(HelloWorldPanel)
