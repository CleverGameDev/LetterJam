import TextField from "@material-ui/core/TextField";
import React from "react";

type GuessingSheetNoteProps = {
  initialText: string;
  onClose(text: string): void;
};

export default function GuessingSheetNote(props: GuessingSheetNoteProps) {
  const { initialText, onClose } = props;
  const [text, setText] = React.useState(initialText);

  return (
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
  );
}
