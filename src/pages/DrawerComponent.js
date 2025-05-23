import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DrawerComponent = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const navigate = useNavigate();

  const PAGES = [
    { label: "Sheets", path: "/Granite_website/granite/SheetsList" },
    { label: "Customers", path: "/Granite_website/granite/customer-details" },
    { label: "Logout", path: "/Granite_website" }, // handle logic separately
  ];

  const handleClick = (path) => {
    setOpenDrawer(false);
    if (path === "/logout") {
      // Add your logout logic here (clear auth, redirect to login, etc.)
      console.log("Logging out...");
      navigate("/"); // Or wherever your login page is
    } else {
      navigate(path);
    }
  };

  return (
    <React.Fragment>
      <Drawer
        anchor="top"
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <List>
          {PAGES.map((page, index) => (
            <ListItemButton key={index} onClick={() => handleClick(page.path)}>
              <ListItemIcon>
                <ListItemText>{page.label}</ListItemText>
              </ListItemIcon>
            </ListItemButton>
          ))}
        </List>
      </Drawer>
      <IconButton
        onClick={() => setOpenDrawer(!openDrawer)}
        sx={{ color: "white" }}
      >
        <MenuIcon sx={{ color: "white" }} />
      </IconButton>
    </React.Fragment>
  );
};

export default DrawerComponent;
