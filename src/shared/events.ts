// E is an Enum of the Event names
export enum E {
  ChangeScene = "change_scene",
}

// EType is a lookup from Event Name to Event Type
export type EType = {
  [E.ChangeScene]: {
    scene: string;
  };
};
