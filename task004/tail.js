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
        resolve(
          linesCount < lines ? 0 : lineOffsets[linesCount - lines + 1] + 1
        );
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

async function getLastLines(fileName, lines) {
  return fs.promises
    .access(fileName, fs.constants.R_OK)
    .catch((err) => {
      throw err;
    })
    .then(async () => {
      if (!isInt(lines)) {
        return Promise.reject(`Value ${lines} is not an integer`);
      }

      if (lines === 0) {
        return Promise.resolve("");
      }

      return new Promise((resolve, reject) => {
        getLastLineOffset(fileName, lines).then((lastLineOffset) => {
          let previousChunkOffset = 0;
          let result = "";

          return fs
            .createReadStream(fileName)
            .on("error", () => reject)
            .on("data", (chunk) => {
              const offset = previousChunkOffset + chunk.length;

              if (offset < lastLineOffset) {
                return;
              }

              result += chunk
                .toString()
                .substr(lastLineOffset - previousChunkOffset);

              previousChunkOffset += chunk.length;
            })
            .on("end", () => {
              resolve(result);
            });
        });
      });
    });
}

async function getLines(fileName, lines) {
  return fs.promises
    .access(fileName, fs.constants.R_OK)
    .catch((err) => {
      throw err;
    })
    .then(async () => {
      if (!isInt(lines)) {
        return Promise.reject(`Value ${lines} is not an integer`);
      }

      if (lines === 0) {
        return Promise.resolve("");
      }

      return new Promise((resolve, reject) => {
        getLineOffset(fileName, lines).then((lineOffset) => {
          let previousChunkOffset = 0;
          let result = "";

          return fs
            .createReadStream(fileName)
            .on("error", () => reject)
            .on("data", (chunk) => {
              const offset = previousChunkOffset + chunk.length;

              if (previousChunkOffset > lineOffset) {
                resolve(result);
              }

              result += chunk
                .toString()
                .substr(0, Math.min(lineOffset, chunk.length));

              previousChunkOffset += chunk.length;
            })
            .on("end", () => {
              resolve(result);
            });
        });
      });
    });
}

async function tailOneFile(fileName, lines) {
  if (fileName && lines) {
    let result = "";

    if (lines === 0) {
      return result;
    } else if (lines < 0) {
      result = await getLastLines(fileName, -lines);
    } else if (lines > 0) {
      result = await getLines(fileName, lines);
    }

    return result;
  }
  return "";
}

function tail(fileList, lines, quiet) {
  if (fileList.length === 1) {
    quiet = true;
  }

  fileList.forEach((fileName) => {
    if (!quiet) {
      console.log(`==> ${fileName} <==`);
    }

    if (lines === 0) {
      return;
    }
    nop();
  });
}

module.exports = {
  getLastLineOffset,
  getLineOffset,
  getLastLines,
  getLines,
  tailOneFile,
  tail,
};
