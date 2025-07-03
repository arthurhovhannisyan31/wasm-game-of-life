import type { FC, PropsWithChildren } from "react";

import { Box } from "@mui/material";

import { containerStyles } from "./styles";

export const Layout: FC<PropsWithChildren> = ({
  children
}) => {
  return (
    <Box sx={containerStyles}>
      {children}
    </Box>
  );
};
