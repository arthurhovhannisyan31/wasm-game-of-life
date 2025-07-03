import { type DragEvent, type UIEvent } from "react";

export const stopImmediatePropagation = (
  e: UIEvent,
): void => {
  e.preventDefault();
  e.stopPropagation();
};

export const preventDragEvent = (
  e: DragEvent<HTMLInputElement>
): void => {
  e.preventDefault();
};
