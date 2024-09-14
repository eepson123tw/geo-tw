/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import fs from "fs";
import path from "path";
import fse from "fs-extra";

// 解析目錄路徑
const sourceDir = path.resolve(process.cwd(), "src/public");
const destDir = path.resolve(process.cwd(), "dist");

// 使用 fs-extra 進行複製操作
fse
  .copy(sourceDir, destDir)
  .then(() => {
    console.log("Public files copied to dist successfully!");
  })
  .catch((err) => {
    console.error("Error copying public files: ", err);
  });
