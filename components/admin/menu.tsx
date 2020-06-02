import AssignmentInd from "@material-ui/icons/AssignmentInd";
import DashboardIcon from "@material-ui/icons/Dashboard";
import Description from "@material-ui/icons/Description";
import GitHub from "@material-ui/icons/GitHub";
import Link from "next/link";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import PeopleIcon from "@material-ui/icons/People";
import React, { ReactElement } from "react";
import Settings from "@material-ui/icons/Settings";


interface MenuItem {
  href: string
  text: string
  icon: ReactElement
}


export function getMenu(items: MenuItem[]): ReactElement {
  // Note: it would be possible to implement dynamic icon by name,
  // but it increases the bundle size (bad design here in the Material UI)
  return (
    <div>
        {items.map(item =>
        <Link
        href={item.href}
        key={item.href}
        >
          <ListItem button>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        </Link>
        )}
    </div>
  )
}


export const mainListItems =
  getMenu([
    {
      href: "/admin",
      text: "Dashboard",
      icon: <DashboardIcon />
    },
    {
      href: "/admin/agreements",
      text: "Agreements",
      icon: <Description />
    },
    {
      href: "/admin/repositories",
      text: "Repositories",
      icon: <GitHub />
    },
    {
      href: "/admin/clas",
      text: "Signed CLAs",
      icon: <PeopleIcon />
    },
    {
      href: "/admin/administrators",
      text: "Administrators",
      icon: <AssignmentInd />
    }
  ]);

export const secondaryListItems =
  getMenu([
    {
      href: "/admin/preferences",
      text: "Preferences",
      icon: <Settings />
    }
  ]);
