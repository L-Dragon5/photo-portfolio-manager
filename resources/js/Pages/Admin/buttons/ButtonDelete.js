import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Delete } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  baseButton: {
    cursor: 'pointer',
  },
}));

const ButtonDelete = ({ onClick, children }) => {
  const classes = useStyles();

  return (
    <Delete
      onClick={onClick}
      key="delete-button"
      className={classes.baseButton}
    />
  );
};

export default ButtonDelete;
