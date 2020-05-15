
import React, { ReactElement } from 'react';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';


export default function Copyright(): ReactElement {
  // TODO: read configuration, make dynamic
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        CLA-Bot
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}
