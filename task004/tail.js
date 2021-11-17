const fs = require("fs");
const isInt = require("./isInt");

function getLastLineOffset(fileName, lines) {
  if (!isInt(lines)) {
    return Promise.reject(`Value ${lines} is not an integer`);
  }
  if (lines === 0)
    return new Promise((resolve) => {
      const stats = fs.statSync(fileName);
      const fileSizeInBytes = stats.size;
      resolve(fileSizeInBytes);
    });

  return new Promise((resolve, reject) => {
    if (!isInt(lines)) {
      return Promise.reject(`Value ${lines} is not an integer`);
    }

    let linesCount = 0;
    let previousChunkOffset = 0;
    const lineOffsets = [];

    return fs
      .createReadStream(fileName)
      .on("error", () => reject)
      .on("data", (chunk) => {
        const offset = previousChunkOffset + chunk.length;
        for (let i = previousChunkOffset; i < offset; ++i)
          if (chunk[i] === 10) {
            lineOffsets[1 + linesCount++] = i + previousChunkOffset;
          }
        previousChunkOffset += chunk.length;
      })
      .on("end", () => {
        resolve(linesCount < lines ? 0 : lineOffsets[linesCount - lines + 1]);
      });
  });
}

function getLineOffset(fileName, lines) {
  if (lines === 0) return Promise.resolve(0);

  return new Promise((resolve, reject) => {
    let linesCount = 0;
    let previousChunkOffset = 0;

    return fs
      .createReadStream(fileName)
      .on("error", () => reject)
      .on("data", (chunk) => {
        const offset = previousChunkOffset + chunk.length;
        for (let i = previousChunkOffset; i < offset; ++i)
          if (chunk[i] === 10) {
            if (lines <= ++linesCount) {
              resolve(i + previousChunkOffset);
            }
          }
        previousChunkOffset += chunk.length;
      })
      .on("end", () => {
        resolve(previousChunkOffset);
      });
  });
}
module.exports = {
  getLastLineOffset,
  getLineOffset,
};
