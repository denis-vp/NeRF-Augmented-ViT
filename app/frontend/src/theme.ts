import { createTheme } from '@mui/material/styles';

const royalPurple = '#7851A9';
const lightRoyalPurple = '#a892d9';
const white = '#ffffff';
const darkGray1 = '#2d2d2d';
const darkGray2 = '#555555';
const lightGreen = '#81c784';
const lightOrange = '#ffb74d';
const lightRed = '#e57373';
const lightBlue1 = '#64b5f6';

const black = '#0d0d0d';
const darkGray3 = '#1a1a1a';
const lightGray = '#cccccc';
const mediumGreen = '#66bb6a';
const orange = '#ffa726';
const red = '#ef5350';
const lightBlue2 = '#4fc3f7';


export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: royalPurple,
    },
    secondary: {
      main: royalPurple,
    },
    background: {
      default: white,
      paper: lightRoyalPurple,
    },
    text: {
      primary: darkGray1,
      secondary: darkGray2,
    },
    success: {
      main: lightGreen,
    },
    warning: {
      main: lightOrange,
    },
    error: {
      main: lightRed,
    },
    info: {
      main: lightBlue1,
    },
  },
  typography: {
    fontFamily: `'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
  },
  shape: {
    borderRadius: 12,
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: royalPurple,
    },
    secondary: {
      main: royalPurple,
    },
    background: {
      default: black,
      paper: darkGray3,
    },
    text: {
      primary: white,
      secondary: lightGray,
    },
    success: {
      main: mediumGreen,
    },
    warning: {
      main: orange,
    },
    error: {
      main: red,
    },
    info: {
      main: lightBlue2,
    },
  },
  typography: {
    fontFamily: `'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
  },
  shape: {
    borderRadius: 12,
  },
});
