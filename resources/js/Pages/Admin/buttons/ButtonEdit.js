import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import { Edit } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  baseButton: {
    cursor: 'pointer',
  },
}));

const ButtonEdit = ({ onClick, children }) => {
  const classes = useStyles();

  return (
    <Edit onClick={onClick} key="edit-button" className={classes.baseButton} />
  );
};

export default ButtonEdit;
