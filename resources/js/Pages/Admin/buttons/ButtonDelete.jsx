import { makeStyles } from '@material-ui/core/styles';
import { Delete } from '@material-ui/icons';
import React from 'react';

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
