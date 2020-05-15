import AssignmentInd from "@material-ui/icons/AssignmentInd";
import DashboardIcon from "@material-ui/icons/Dashboard";
import Description from "@material-ui/icons/Description";
import GitHub from "@material-ui/icons/GitHub";
import Link from "next/link";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PeopleIcon from "@material-ui/icons/People";
import React from "react";


export const mainListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <Link href="/admin">
        <ListItemText primary="Dashboard" />
      </Link>
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <Description />
      </ListItemIcon>
      <Link href="/admin/agreements">
        <ListItemText primary="Agreements" />
      </Link>
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <GitHub />
      </ListItemIcon>
      <Link href="/admin/repositories">
        <ListItemText primary="Repositories" />
      </Link>
    </ListItem>
    <ListItem button>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <Link href="/admin/clas">
        <ListItemText primary="Signed CLAs" />
      </Link>
    </ListItem>
  </div>
);

export const secondaryListItems = (
  <div>
    <ListItem button>
      <ListItemIcon>
        <AssignmentInd />
      </ListItemIcon>
      <ListItemText primary="Administrators" />
    </ListItem>
  </div>
);
