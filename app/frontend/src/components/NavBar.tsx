import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Switch
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

interface NavBarProps {
  height: string;
  mode: "light" | "dark";
  onToggleMode: () => void;
}

export default function NavBar({
  height = "8vh",
  mode,
  onToggleMode,
}: NavBarProps) {
  const theme = useTheme();

  return (
    <AppBar
      position="static"
      sx={{
        height,
        width: { xs: "90vw", sm: "90vw", md: "90vw", lg: "90vw" },
        mx: "auto",
        justifyContent: "center",
        backgroundColor: theme.palette.background.paper,
        boxShadow: "none",
        backdropFilter: "blur(8px)",
        borderRadius: 3,
        marginTop: 2,
        marginBottom: 2,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ minHeight: height }}>
        {/* Left Side */}
        <Typography variant="h6" sx={{ flexGrow: 1, color: theme.palette.text.primary }}>
          NeRF-Augmented ViT Training
        </Typography>
        {/* Right Side */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          {/* Theme Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", color: theme.palette.text.primary }}>
            <LightModeIcon fontSize="small" />
            <Switch
              checked={mode === "dark"}
              onChange={onToggleMode}
              color="default"
              inputProps={{ "aria-label": "toggle theme mode" }}
            />
            <DarkModeIcon fontSize="small" />
          </Box>
          <Button
            color="inherit"
            component={RouterLink}
            to="/depth-anything-v2"
            sx={{ color: theme.palette.text.primary }}
          >
            Depth-Anything-V2
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/tiny-RoMa"
            sx={{ color: theme.palette.text.primary }}
          >
            tiny-RoMa
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}