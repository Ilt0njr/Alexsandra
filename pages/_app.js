import { ChakraProvider, extendTheme, CSSReset } from "@chakra-ui/react";
import { initializeApp } from "firebase/app";
import "../globals.css";

export const App = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_ID + ".firebaseapp.com",
  databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_ID}-default-rtdb.firebaseio.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_ID + ".appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDERID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENTID,
});

const theme = extendTheme({
  fonts: {
    body: `'Roboto Serif', serif`,
  },
  colors: {
    primary: "#ed709D",
    secondary: "#42B392",
    hover_primary: "#f089ae",
    brand: {
      50: "#FCE8F0",
      100: "#F7C0D4",
      200: "#F297B8",
      300: "#ED6E9D",
      400: "#E84581",
      500: "#Ed709d",
      600: "#B51751",
      700: "#88113D",
      800: "#5B0B29",
      900: "#2D0614",
    },
  },

  components: {
    Button: {
      variants: {
        primary: {
          bg: "primary",
          color: "white",
          borderRadius: "none",
          gap: "10px",
          _hover: {
            bg: "hover_primary",
          },
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ChakraProvider theme={theme} CSSReset>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}

export default MyApp;
