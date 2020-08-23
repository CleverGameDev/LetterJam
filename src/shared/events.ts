// Event names
export enum EVENTS {
  CHANGE_SCENE = "change_scene",
}

// Event schemas
export type ChangeSceneEvent = {
  scene: string;
};
