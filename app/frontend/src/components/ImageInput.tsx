import React, { useRef } from "react";
import { Box, Paper, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon from "@mui/icons-material/Image";

interface ImageInputProps {
  imageUrl?: string;
  fileName?: string;
  label?: string;
  loading?: boolean;
  maxHeight?: string | number;
  sx?: object;
  onImageChange: (file: File, url: string) => void;
}

export default function ImageInput({
  imageUrl,
  fileName,
  label = "Image Input",
  maxHeight = "40vh",
  sx = {},
  onImageChange,
}: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageChange(file, url);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onImageChange(file, url);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        bgcolor: "background.default",
        overflow: "hidden",
        cursor: "pointer",
        p: 0,
        maxHeight,
        aspectRatio: "3 / 4",
        minWidth: 0,
        ...sx,
      }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Header bar */}
      <Box
        sx={{
          flexShrink: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          height: 40,
          bgcolor: "background.paper",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <ImageIcon fontSize="small" />
        <Typography variant="subtitle2">{label}</Typography>
      </Box>

      {/* Main content */}
      {imageUrl ? (
        <>
          <Box
            sx={{
              flex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={imageUrl}
              alt="Input"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </Box>
          {fileName && (
            <Box
              sx={{
                width: "100%",
                textAlign: "center",
                py: 1,
                fontSize: 13,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: "background.paper",
              }}
            >
              {fileName}
            </Box>
          )}
        </>
      ) : (
        <Box
          sx={{
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            userSelect: "none",
            p: 4,
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography>Drop Image Here</Typography>
          <Typography variant="body2">- or -</Typography>
          <Typography>Click to Upload</Typography>
        </Box>
      )}
    </Paper>
  );
}