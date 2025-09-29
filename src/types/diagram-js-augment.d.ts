import "diagram-js/lib/core/Canvas";

declare module "diagram-js/lib/core/Canvas" {
  interface Canvas {
    zoom(zoom: "fit-viewport", center?: "auto" | { x: number; y: number }): void;
  }
}