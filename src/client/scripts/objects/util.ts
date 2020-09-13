interface CanToggleOpenClose {
  isOpen(): boolean;
  close(): any;
  open(): any;
}

export function toggleOpenClose(o: CanToggleOpenClose) {
  if (o.isOpen()) {
    o.close();
  } else {
    o.open();
  }
}
