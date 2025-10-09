import io
from PIL import Image
import gradio as gr

from src.model_mangers.depth_manager import DepthManager
from src.utils.depth_visualizer import depth_to_colormap, colormaps
from src.config import DEPTH_MODELS, DEPTH_BASE_MODEL

depth_manager = DepthManager()


def _select_model(model_name: str):
    depth_manager.select_model(model_name)
    return gr.update(interactive=True)


def _apply_colormap(depth, colormap):
    return depth_to_colormap(depth, mode=colormap)


def _run_depth_estimation(input_img: Image, colormap: str):
    with io.BytesIO() as output:
        input_img.save(output, format="JPEG")
        image_bytes = output.getvalue()

    depth = depth_manager.predict(image_bytes, normalize=True)

    color_map_img = depth_to_colormap(depth, mode=colormap)
    return depth, color_map_img


def get_depth_ui():
    with gr.Tab("Depth-Anything-V2") as depth_tab:
        depth_state = gr.State()

        with gr.Row():
            with gr.Column(elem_classes=["equal-height"]):
                model_selector = gr.Dropdown(
                    choices=DEPTH_MODELS.keys(),
                    value=DEPTH_BASE_MODEL,
                    show_label=False
                )
                input_image = gr.Image(type="pil", label="Input Image")

            with gr.Column(elem_classes=["equal-height"]):
                colormap_selector = gr.Dropdown(
                    choices=colormaps.keys(),
                    value=list(colormaps.keys())[0],
                    show_label=False
                )
                output_depth = gr.Image(type="pil", label="Depth Map")

        run_button = gr.Button("Run Inference")

        run_button.click(
            fn=_run_depth_estimation,
            inputs=[input_image, colormap_selector],
            outputs=[depth_state, output_depth]
        )

        model_selector.change(
            fn=_select_model,
            inputs=model_selector,
            outputs=run_button,
            preprocess=False,
            postprocess=False,
            queue=True
        )

        colormap_selector.change(
            fn=_apply_colormap,
            inputs=[depth_state, colormap_selector],
            outputs=output_depth
        )

    return depth_tab
