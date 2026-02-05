import { ThemeProvider, createTheme } from "@mui/material/styles";

const darkred = "#6F0A21";

const theme = createTheme({
  palette: {
    primary: {
      main: darkred,
    },
    secondary: {
      main: "#FFFFFF",
    },
    darkred: {
      main: darkred,
    },
    white: {
      main: "#FFFFFF",
    },
    green: {
      main: "#0f430f",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          "&.active": {
            textDecoration: "underline",
          },

          "&.Mui-disabled": {
            backgroundColor: "#6F0A21",
            opacity: 0.4,
            color: "white",
          },
        },
      },
    },
    MuiDropzoneArea: {
      styleOverrides: {
        root: {
          border: "2px dashed #000",
          borderRadius: "4px",
          padding: "20px",
          textAlign: "center",
          color: "#333",
          backgroundColor: "#f9f9f9",
          "&:hover": {
            backgroundColor: "#f1f1f1",
          },
          // Anpassungen der Größe
          width: "300px",
          height: "200px",
        },
      },
    },
  },
});

export default theme;
