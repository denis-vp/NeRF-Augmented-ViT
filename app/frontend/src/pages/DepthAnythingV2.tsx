import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  Typography,
  type SelectChangeEvent,
  FormControl,
  InputLabel,
} from "@mui/material";
import { depthModels, type DepthModel } from "../utils/models.ts";
import {
  colormapModes,
  depthToColormap,
  type ColormapMode,
} from "../utils/depthVisualizer.ts";
import ImageInput from "../components/ImageInput.tsx";
import ImageOutput from "../components/ImageOutput.tsx";
import {
  getCurrentDepthModel,
  selectDepthModel,
  predictDepth,
} from "../api/depthApi.ts";
import type { DepthPredictResponse } from "../api/depthTypes.ts";

interface DepthAnythingV2Props {
  showSnackbar: (
    message: string,
    severity?: "error" | "success" | "info" | "warning",
    error?: Error | null
  ) => void;
}

export default function DepthAnythingV2({
  showSnackbar,
}: DepthAnythingV2Props) {
  // State for input image and file name
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [inputImageName, setInputImageName] = useState<string>("");
  const [inputImageUrl, setInputImageUrl] = useState<string>("");

  // State for selected settings
  const [model, setModel] = useState<DepthModel>(depthModels[0]);
  const [colormapMode, setColormapMode] = useState<ColormapMode>(
    colormapModes[0]
  );

  // State for output image
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [depthPrediction, setDepthPrediction] =
    useState<DepthPredictResponse | null>(null);

  // Misc state
  const [loading, setLoading] = useState<boolean>(false);
  const [inferenceDisabled, setInferenceDisabled] = useState<boolean>(false);

  // Set the initial model when the component mounts
  useEffect(() => {
    setCurrentModel();
  }, []);

  // Rerender the output image when depth prediction or colormap change
  useEffect(() => {
    if (depthPrediction) {
      const canvas = depthToColormap(depthPrediction.depth, colormapMode);
      const dataUrl = canvas.toDataURL("image/png");
      setOutputUrl(dataUrl);
    }
  }, [colormapMode, depthPrediction]);

  // API call to get the current model
  const setCurrentModel = () => {
    getCurrentDepthModel()
      .then((res) => {
        if (res.status == "ok" && res.current) {
          const modelName = res.current.model_name;
          if (depthModels.some((model) => model === modelName)) {
            setModel(modelName as DepthModel);
          } else {
            showSnackbar(
              `Current model "${modelName}" is not supported`,
              "error"
            );
          }
        } else {
          showSnackbar("Failed to load current model", "error");
        }
      })
      .catch((err) => {
        showSnackbar("Failed to load current model", "error", err);
      });
  };

  // API call to change the model
  const handleModelChange = (e: SelectChangeEvent<string>) => {
    const model = e.target.value;
    setModel(model as DepthModel);

    setInferenceDisabled(true);

    selectDepthModel({ model_name: model as DepthModel })
      .then(() => {
        showSnackbar(`Model changed successfully`, "success");
      })
      .catch((err) => {
        showSnackbar(`Failed to change model`, "error", err);
        setCurrentModel();
      })
      .finally(() => {
        setInferenceDisabled(false);
      });
  };

  // API call to run inference
  const handleRunInference = () => {
    if (!inputImage) {
      showSnackbar("Please upload an input image first.", "warning");
      return;
    }

    setLoading(true);

    predictDepth(inputImage)
      .then((response) => {
        setDepthPrediction(response);
      })
      .catch((err) => {
        setOutputUrl("");
        showSnackbar(
          "Failed to run inference. Please try again.",
          "error",
          err
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        px: 10,
        py: 5,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h4">Depth-Anything-V2</Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          {/* Model Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="model-label">Model</InputLabel>
            <Select
              labelId="model-label"
              label="Model"
              value={model}
              onChange={handleModelChange}
              size="small"
            >
              {depthModels.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Colormap Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="colormap-label">Colormap</InputLabel>
            <Select
              labelId="colormap-label"
              label="Colormap"
              value={colormapMode}
              onChange={(e) => setColormapMode(e.target.value as ColormapMode)}
              size="small"
            >
              {colormapModes.map((colormapMode) => (
                <MenuItem key={colormapMode} value={colormapMode}>
                  {colormapMode}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      {/* Two columns */}
      <Box sx={{ display: "flex", gap: 4 }}>
        <ImageInput
          imageUrl={inputImageUrl}
          onImageChange={(file: File, url: string) => {
            setInputImageUrl(url);
            setInputImage(file);
            setInputImageName(file.name);
            setOutputUrl("");
          }}
          fileName={inputImageName}
          label="Input Image"
          maxHeight="50vh"
        />
        <ImageOutput
          imageUrl={outputUrl}
          loading={loading}
          label="Depth Map"
          maxHeight="50vh"
        />
      </Box>
      {/* Inference button */}
      <Button
        variant="contained"
        onClick={handleRunInference}
        disabled={!inputImage || loading || inferenceDisabled}
      >
        {loading ? "Running..." : "Run Inference"}
      </Button>
    </Box>
  );
}
