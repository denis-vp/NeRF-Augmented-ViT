import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import DepthAnythingV2 from "./pages/DepthAnythingV2";
import { useState } from "react";
import {
  Alert,
  Box,
  CssBaseline,
  Snackbar,
  ThemeProvider,
} from "@mui/material";
import TinyRoMa from "./pages/TinyRoMa";
import { darkTheme, lightTheme } from "./theme";

export default function App() {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity?: "error" | "success" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const showSnackbar = (
    message: string,
    severity: "error" | "success" | "info" | "warning" = "info",
    error?: Error | null
  ) => {
    if (severity === "error") {
      console.error(message, error);
    }
    setSnackbar({ open: true, message, severity });
  };

  const handleClose = () => setSnackbar({ ...snackbar, open: false });

  const [mode, setMode] = useState<"light" | "dark">("light");

  const theme = mode === "dark" ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <NavBar
            height={"8vh"}
            mode={mode}
            onToggleMode={() => setMode(mode === "dark" ? "light" : "dark")}
          />
          <Box
            sx={{
              flex: 1,
            }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="/depth-anything-v2" replace />} />
              <Route
                path="/depth-anything-v2"
                element={<DepthAnythingV2 showSnackbar={showSnackbar} />}
              />
              <Route
                path="/tiny-RoMa"
                element={<TinyRoMa showSnackbar={showSnackbar} />}
              />
            </Routes>
          </Box>
          <Box
            component="footer"
            sx={{
              textAlign: "center",
              padding: "16px",
              color: "#888",
              bgcolor: "background.default",
              flexShrink: 0,
            }}
          >
            &copy; 2025 NeRF-Augmented ViT Training
          </Box>
        </Box>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Alert onClose={handleClose} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </BrowserRouter>
    </ThemeProvider>
  );
}
