import { useEffect, useState } from "react";
import { romaModels, type RomaModel } from "../utils/models";
import type { RomaPredictionResponse } from "../api/romaTypes";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
  type SelectChangeEvent,
  FormControl,
  InputLabel,
  Slider,
} from "@mui/material";
import ImageInput from "../components/ImageInput";
import ImageOutput from "../components/ImageOutput";
import {
  getCurrentRomaModel,
  predictRomaMatch,
  selectRomaModel,
} from "../api/romaApi";
import { drawMatches } from "../utils/matcherVisualizer";

interface TinyRoMaProps {
  showSnackbar: (
    message: string,
    severity?: "error" | "success" | "info" | "warning",
    error?: Error | null
  ) => void;
}

export default function TinyRoMa({ showSnackbar }: TinyRoMaProps) {
  // State for input images and file names
  const [inputImageA, setInputImageA] = useState<File | null>(null);
  const [inputImageB, setInputImageB] = useState<File | null>(null);
  const [inputImageNameA, setInputImageNameA] = useState<string>("");
  const [inputImageNameB, setInputImageNameB] = useState<string>("");
  const [inputImageUrlA, setInputImageUrlA] = useState<string>("");
  const [inputImageUrlB, setInputImageUrlB] = useState<string>("");

  // State for selected settings
  const [model, setModel] = useState<RomaModel>(romaModels[0]);
  const [topK, setTopK] = useState<number>(50);

  // State for output image
  const [outputUrl, setOutputUrl] = useState<string>("");
  const [romaPrediction, setRomaPrediction] =
    useState<RomaPredictionResponse | null>(null);

  // Misc state
  const [loading, setLoading] = useState<boolean>(false);
  const [inferenceDisabled, setInferenceDisabled] = useState<boolean>(false);

  // Set the initial model when the component mounts
  useEffect(() => {
    setCurrentModel();
  }, []);

  // Rerender the output image when roma prediction or topK change
  useEffect(() => {
    if (!romaPrediction) return;

    const renderCanvas = async () => {
      const canvas = await drawMatches(
        inputImageUrlA,
        inputImageUrlB,
        {
          kptsA: romaPrediction.kptsA,
          kptsB: romaPrediction.kptsB,
          H_A: romaPrediction.H_A,
          W_A: romaPrediction.W_A,
          H_B: romaPrediction.H_B,
          W_B: romaPrediction.W_B,
        },
        topK // Pass topK to drawMatches
      );
      const dataUrl = canvas.toDataURL("image/png");
      setOutputUrl(dataUrl);
    };

    renderCanvas();
  }, [romaPrediction, topK]);

  // API call to get the current model
  const setCurrentModel = () => {
    getCurrentRomaModel()
      .then((res) => {
        if (res.status == "ok" && res.current) {
          const modelName = res.current.model_name;
          if (romaModels.some((model) => model === modelName)) {
            setModel(modelName as RomaModel);
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
    setModel(model as RomaModel);

    setInferenceDisabled(true);

    selectRomaModel({ model_name: model as RomaModel })
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
    if (!inputImageA || !inputImageB) {
      showSnackbar("Please upload both input images first.", "warning");
      return;
    }

    setLoading(true);

    predictRomaMatch(inputImageA, inputImageB)
      .then((response) => {
        setRomaPrediction(response);
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
        <Typography variant="h4">tiny-RoMa</Typography>
        {/* TopK Slider */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ minWidth: 180, px: 2 }}>
            <Typography
              id="topk-slider-label"
              gutterBottom
              sx={{ fontSize: 13 }}
            >
              Top K Matches: {topK}
            </Typography>
            <Slider
              value={topK}
              min={1}
              max={200}
              step={1}
              onChange={(_, value) => setTopK(value as number)}
              aria-labelledby="topk-slider-label"
              size="small"
            />
          </Box>
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
              {romaModels.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
      {/* Two columns */}
      <Box sx={{ display: "flex", gap: 4 }}>
        {/* Left column for input images */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "row", gap: 2 }}>
          <ImageInput
            imageUrl={inputImageUrlA}
            onImageChange={(file: File, url: string) => {
              setInputImageUrlA(url);
              setInputImageA(file);
              setInputImageNameA(file.name);
              setOutputUrl("");
            }}
            fileName={inputImageNameA}
            label="Image A"
            maxHeight="40vh"
          />
          <ImageInput
            imageUrl={inputImageUrlB}
            onImageChange={(file: File, url: string) => {
              setInputImageUrlB(url);
              setInputImageB(file);
              setInputImageNameB(file.name);
              setOutputUrl("");
            }}
            fileName={inputImageNameB}
            label="Image B"
            maxHeight="40vh"
          />
        </Box>
        <ImageOutput
          imageUrl={outputUrl}
          loading={loading}
          label="Depth Map"
          maxHeight="40vh"
        />
      </Box>
      {/* Inference button */}
      <Button
        variant="contained"
        onClick={handleRunInference}
        disabled={!inputImageA || !inputImageB || loading || inferenceDisabled}
      >
        {loading ? "Running..." : "Run Inference"}
      </Button>
    </Box>
  );
}
