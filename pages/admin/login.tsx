import Head from "next/head";
import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { Button, Container } from "@material-ui/core";
import { Component } from "react";


export default class AdminLoginPage extends Component {

  render() {
    return (
      <Container className="contributor-agreement-area" maxWidth="md">
        <Head>
          <title>Admin Login</title>
          <link rel="icon" href="/favicon.png" type="image/x-icon" />
        </Head>
        <main>
          <Avatar>
            <LockOutlinedIcon />
          </Avatar>
         <Button variant="contained" color="primary">
           <i className="fab fa-github"></i>
           <a href="/api/admins/auth/github">Sign in with GitHub</a>
         </Button>
        </main>
        <footer>
        </footer>
      </Container>
    )
  }
}
