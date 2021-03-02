import React from 'react';

import { ButtonBase } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Add } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  baseButton: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    width: '200px',
    padding: theme.spacing(1, 2),
    margin: theme.spacing(2, 0),
    fontSize: '1.2rem',
  },
}));

const ButtonAdd = ({ onClick, children }) => {
  const classes = useStyles();

  return (
    <ButtonBase
      onClick={onClick}
      focusRipple
      key="add-button"
      className={classes.baseButton}
    >
      <Add /> {children}
    </ButtonBase>
  );
};

export default ButtonAdd;
