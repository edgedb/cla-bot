import Head from "next/head";
import React, { ReactElement } from 'react';
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Button, Container, Grid } from "@material-ui/core";
import { Component } from "react";


export default class AdminLoginPage extends Component {

  render(): ReactElement {
    return (
      <Container className="contributor-agreement-area" maxWidth="md">
        <Head>
          <title>Admin Login</title>
          <link rel="icon" href="/favicon.png" type="image/x-icon" />
        </Head>
        <main>
          <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={4}
          >
            <Grid item xs={12} sm={6}>
              <Avatar>
                <LockOutlinedIcon />
              </Avatar>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Button variant="contained" color="primary">
                <i className="fab fa-github"></i>
                <a href="/api/admins/auth/github">Sign in with GitHub</a>
              </Button>
            </Grid>
          </Grid>
        </main>
        <footer>
        </footer>
      </Container>
    )
  }
}
