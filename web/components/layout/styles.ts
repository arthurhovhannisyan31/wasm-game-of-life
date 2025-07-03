import type { SxProps } from "@mui/material";

export const containerStyles: SxProps = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  height: "100%",
  alignItems: "center",
  background: `
    linear-gradient(180deg, hsla(0,0%,100%,0) 0, #fff 1600px),
    fixed 0 0 /20px 20px radial-gradient(#ffa6a6 1px,transparent 0),
    fixed 10px 10px /20px 20px radial-gradient(#7b92ee 1px,transparent 0)
  `,
  overflow: "auto"
};
