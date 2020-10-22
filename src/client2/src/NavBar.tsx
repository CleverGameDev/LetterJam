import { IconButton } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import { makeStyles } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

type NavBarProps = {
  scene?: string;
};

const NavBar = (props: NavBarProps) => {
  const { scene } = props;

  const classes = useStyles();

  // TODO: Show your player name in top right
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {scene ? `LetterJam: ${scene} Scene` : "Letter Jam"}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
};
export default NavBar;
