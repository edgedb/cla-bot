import CssBaseline from "@material-ui/core/CssBaseline";
import Head from "next/head";
import React, { ReactElement } from "react";
import theme from "../components/theme";
import { AppProps } from "next/app";
import { ThemeProvider } from "@material-ui/core/styles";
import "normalize.css";
import "../styles/global.scss";
import "react-markdown-editor-lite/lib/index.css";


export default function App(props: AppProps): ReactElement {
  const { Component, pageProps } = props;

  React.useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement!.removeChild(jssStyles);
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="/favicon.png" type="image/x-icon" />
        <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
        <link rel="stylesheet" type="text/css" href="https://use.fontawesome.com/releases/v5.12.0/css/all.css" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </React.Fragment>
  );
}
