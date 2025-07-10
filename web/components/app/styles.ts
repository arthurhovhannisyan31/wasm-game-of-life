import type { SxProps } from "@mui/material";
import type { Mark } from "@mui/material/Slider/useSlider.types";

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
  justifyContent: "space-between",
};

export const sliderStyles: SxProps = {
  width: "200px"
};

export const sliderMarks: Mark[] = [{
  value: 4,
  label: "4",
}, {
  value: 10,
  label: "10",
}, {
  value: 15,
  label: "15",
}, {
  value: 20,
  label: "20",
}, {
  value: 30,
  label: "30",
}, {
  value: 60,
  label: "60"
}];
