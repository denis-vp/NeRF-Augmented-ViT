import gradio as gr

from src.gradio_app.depth_ui import get_depth_ui
from src.gradio_app.roma_ui import get_roma_ui

with gr.Blocks(title="NeRF-Augmented ViT Training") as demo:
    with gr.Tabs():
        depth_tab = get_depth_ui()
        tiny_roma_tab = get_roma_ui()

if __name__ == "__main__":
    demo.launch()
