import os
import tempfile
from PIL import Image
import gradio as gr

from src.config import ROMA_MODELS

from src.model_mangers.roma_manager import RomaManager, RomaPrediction
from src.utils.matcher_visualizer import draw_matches

roma_manager = RomaManager()


def _select_model(model_name: str):
    roma_manager.select_model(model_name)
    return gr.update(interactive=True)


def _apply_k_slider(match_data: RomaPrediction, imgA_data: Image, imgB_data: Image, k: int):
    output_img = draw_matches(imgA_data, imgB_data, match_data, k=k)
    return output_img


def _run_feature_matching(imgA: Image, imgB: Image, k: int):
    path1 = path2 = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f1, \
                tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f2:
            imgA.save(f1.name, format="JPEG")
            imgB.save(f2.name, format="JPEG")
            path1, path2 = f1.name, f2.name

        match_data = roma_manager.predict(path1, path2)
        output_img = draw_matches(imgA, imgB, match_data, k=k)
        return match_data, imgA, imgB, output_img
    finally:
        if path1 and os.path.exists(path1):
            os.remove(path1)
        if path2 and os.path.exists(path2):
            os.remove(path2)


def get_roma_ui():
    with gr.Tab("tiny-RoMa") as roma_tab:
        match_data = gr.State()
        imgA_data = gr.State()
        imgB_data = gr.State()

        with gr.Row():
            with gr.Column():
                model_selector = gr.Dropdown(
                    choices=ROMA_MODELS.keys(),
                    value=list(ROMA_MODELS.keys())[0],
                    show_label=False
                )
                with gr.Row():
                    input_image_A = gr.Image(type="pil", label="Image A")
                    input_image_B = gr.Image(type="pil", label="Image B")

            with gr.Column():
                k_slider = gr.Slider(
                    minimum=1,
                    maximum=200,
                    value=50,
                    step=1,
                    label="Number of matches to draw (k)"
                )
                output_img = gr.Image(type="pil", label="Matched Keypoints")

        run_button = gr.Button("Run Inference")

        run_button.click(
            fn=_run_feature_matching,
            inputs=[input_image_A, input_image_B, k_slider],
            outputs=[match_data, imgA_data, imgB_data, output_img]
        )

        model_selector.change(
            fn=_select_model,
            inputs=model_selector,
            outputs=run_button,
            preprocess=False,
            postprocess=False,
            queue=True
        )

        k_slider.change(
            fn=_apply_k_slider,
            inputs=[match_data, imgA_data, imgB_data, k_slider],
            outputs=output_img
        )

    return roma_tab
