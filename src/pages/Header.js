import React from "react";
import {
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import DrawerComponent from "./DrawerComponent";

const Header = () => {
  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();

  const PAGES = [
    { label: "Sheets", path: "/Granite_website/granite/SheetsList" },
    { label: "Customers", path: "/Granite_website/granite/customer-details" },
  ];

  // Get tab index based on current path
  const getCurrentTabIndex = () => {
    const currentPage = PAGES.findIndex((page) => location.pathname.startsWith(page.path));
    return currentPage === -1 ? false : currentPage;
  };

  const [value, setValue] = React.useState(getCurrentTabIndex());

  React.useEffect(() => {
    setValue(getCurrentTabIndex());
  }, [location.pathname]);

  return (
    <React.Fragment>
      <AppBar sx={{ backgroundColor: "black" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, padding: "10px" }}>
            JBI
          </Typography>
          {isMatch ? (
            <DrawerComponent />
          ) : (
            <Tabs
              sx={{ marginLeft: "auto" }}
              textColor="inherit"
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
                navigate(PAGES[newValue].path);
              }}
              indicatorColor="secondary"
            >
              {PAGES.map((page, index) => (
                <Tab
                  key={index}
                  label={page.label}
                  sx={{ color: "white" }}
                />
              ))}
            </Tabs>
          )}
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default Header;
