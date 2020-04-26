import {createElement} from "react";
import {AppProps} from "next/app";

import "normalize.css";
import "../styles/global.scss";

const App = ({Component, pageProps}: AppProps) => {
  return createElement(Component, pageProps);
};

export default App;
