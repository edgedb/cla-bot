import { createMuiTheme } from '@material-ui/core/styles';
import red from '@material-ui/core/colors/red';


export default createMuiTheme({
  palette: {
    primary: {
      main: '#483d8b',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    }
  },

});
