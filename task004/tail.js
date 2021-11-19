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

    let previousChunkLinesCount = 0;
    let previousChunkOffset = 0;
    const result = [];

    return fs
      .createReadStream(fileName)
      .on("error", () => reject)
      .on("data", (chunk) => {
        let currentChunkLinesCount = 0;
        for (let i = 0; i < chunk.length; ++i)
          if (chunk[i] === 10) {
            result[previousChunkLinesCount + 1 + currentChunkLinesCount++] =
              i + previousChunkOffset;
          }
        previousChunkOffset += chunk.length;
        previousChunkLinesCount += currentChunkLinesCount;
      })
      .on("end", () => {
        resolve(
          previousChunkLinesCount < lines
            ? 0
            : result[result.length - lines] + 1
        );
      });
  });
}

function getLineOffset(fileName, lines) {
  if (lines === 0) return Promise.resolve(0);

  return new Promise((resolve, reject) => {
    let currentLinesCount = 0;
    let previousChunkOffset = 0;

    return fs
      .createReadStream(fileName)
      .on("error", () => reject)
      .on("data", (chunk) => {
        for (let i = 0; i < chunk.length; ++i)
          if (chunk[i] === 10) {
            if (lines <= ++currentLinesCount) {
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
    .then(() => {
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

              if (offset >= lastLineOffset) {
                result += chunk.toString().substr(lastLineOffset - offset);
              }
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
    .then(() => {
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

              if (previousChunkOffset > lineOffset && offset > lineOffset) {
                resolve(result);
              }

              result += chunk
                .toString()
                .substr(
                  0,
                  Math.min(lineOffset - previousChunkOffset, chunk.length)
                );

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

  promiseSequence(fileList, (fileName) => {
    if (!quiet) {
      console.log(`==> ${fileName} <==`);
    }

    if (lines !== 0) {
      return tailOneFile(fileName, lines);
    }
    return undefined;
  });
}

function promiseSequence(fileList, promiseMaker) {
  fileList = [...fileList];
  function handleNextInput(outputs) {
    if (fileList.length === 0) {
      return outputs;
    } else {
      const nextInput = fileList.shift();
      return promiseMaker(nextInput)
        .then((output) => console.log(output))
        .then(handleNextInput);
    }
  }
  return Promise.resolve([]).then(handleNextInput);
}

module.exports = {
  getLastLineOffset,
  getLineOffset,
  getLastLines,
  getLines,
  tailOneFile,
  tail,
};
