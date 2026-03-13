import { writeFileSync } from "node:fs";

const { generateCSS } = await import("../dist/player.esm.js");
writeFileSync("dist/player.css", generateCSS());
