import Paper, { PaperProps } from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
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
  const [text, setText] = React.useState(initialText);

  return (
    <>
      <TextField
        autoFocus
        margin="dense"
        id="name"
        fullWidth
        value={text}
        // @ts-ignore
        onInput={(e) => setText(e.target.value)}
        onBlur={(e) => onClose(text)}
      />
    </>
  );
}
