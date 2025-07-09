import type { SxProps } from "@mui/material";

export const containerStyles: SxProps = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  height: "100%",
  alignItems: "center",
  justifyContent: "center"
};

export const contentStyles: SxProps = {
  display: "flex",
  border: "1px solid black",
  padding: "12px",
  lineHeight: "9px",
  alignItems: "center",
  justifyContent: "center"
};

export const controlsContainerStyles: SxProps = {
  display: "flex",
  width: "100%",
  justifyContent: "space-evenly",
};
