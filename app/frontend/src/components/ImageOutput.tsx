import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import DownloadIcon from "@mui/icons-material/Download";

interface ImageOutputProps {
  imageUrl?: string;
  label?: string;
  loading?: boolean;
  maxHeight?: string | number;
  sx?: object;
}

export default function ImageOutput({
  imageUrl,
  label = "Output Image",
  loading = false,
  maxHeight = "40vh",
  sx = {},
}: ImageOutputProps) {
  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "output.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        p: 0,
        maxHeight,
        aspectRatio: "3 / 4",
        minWidth: 0,
        ...sx,
      }}
    >
      {/* Header bar */}
      <Box
        sx={{
          flexShrink: 0,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          height: 40,
          bgcolor: "background.paper",
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ImageIcon fontSize="small" />
          <Typography variant="subtitle2" lineHeight={1}>
            {label}
          </Typography>
        </Box>
        {imageUrl && !loading && (
          <Tooltip title="Download">
            <IconButton onClick={handleDownload} size="small">
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Image or loading */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0,
          m: 0,
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Output"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              display: "block",
              margin: 0,
              padding: 0,
              border: "none",
            }}
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
              color: "text.secondary",
              userSelect: "none",
            }}
          >
            <ImageIcon sx={{ fontSize: 48, mb: 1 }} />
            <Typography>No output image</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
