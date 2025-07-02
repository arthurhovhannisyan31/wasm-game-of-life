/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const express = require("express");

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static(path.join(process.cwd(), "dist")));

app.listen(PORT, () => {
  console.log(`The app is running on port http://localhost:${PORT}`);
});
