import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper, { PaperProps } from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import EditIcon from "@material-ui/icons/Edit";
import React from "react";
import Draggable from "react-draggable";

function PaperComponent(props: PaperProps) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

type GuessingSheetEditModalProps = {
  initialText: string;
  onClose(text: string): void;
};

export default function GuessingSheetEditModal(
  props: GuessingSheetEditModalProps
) {
  const { initialText, onClose } = props;
  const [open, setOpen] = React.useState(false);
  const [text, setText] = React.useState(initialText);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    onClose(text);
    setOpen(false);
  };

  return (
    <>
      <EditIcon onClick={handleClickOpen} />
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Guess</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Keep notes about possible words here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="your notes"
            fullWidth
            value={text}
            // @ts-ignore
            onInput={(e) => setText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
