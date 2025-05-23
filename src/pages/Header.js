import {
  AppBar,
  Tabs,
  Tab,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import DrawerComponent from "./DrawerComponent";

const Header = () => {
  const [value, setValue] = React.useState();
  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  const PAGES = ["Sheets", "Customers"];
  return (
    <React.Fragment>
      <AppBar sx={{ backgroundColor: "black"}}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, padding: "10px" }}>
            JBI
          </Typography>
          {isMatch ? (
            <>
              <DrawerComponent />
            </>
          ) : (
            <Tabs
              sx={{ marginLeft: "auto" }}
              textColor="inherit"
              value={value}
              onChange={(event, newValue) => setValue(newValue)}
              indicatorColor="secondary"
                          >
                              {
                                  PAGES.map((page, index) => (
                                      <Tab
                                          key={index}
                                          label={page}
                                          sx={{ color: "white" }}
                                      />
                                  ))
                              }
            </Tabs>
          )}
        </Toolbar>
      </AppBar>
    </React.Fragment>
  );
};

export default Header;
