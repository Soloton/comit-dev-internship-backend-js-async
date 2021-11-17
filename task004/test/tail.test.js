const fs = require("fs");
const os = require("os");
const faker = require("faker");
const {
  getLastLineOffset,
  getLineOffset,
} = require("../tail");

function random(min, max) {
  return Math.trunc(Math.random() * (max - min + 1)) + min;
}

describe("Const offset of", () => {
  const fileName = "/tmp/0.txt";
  const dataLineCount = random(2, 5);
  const data = `${"*".repeat(9)}\n`.repeat(dataLineCount).slice(0, -1);

  const dataAppendLineCount = random(2, 5);
  const dataAppend = `${"*".repeat(9)}\n`
    .repeat(dataAppendLineCount)
    .slice(0, -1);
  fs.writeFileSync(fileName, data + os.EOL + dataAppend);

  it(`the last line is correct (${dataAppendLineCount})`, async () => {
    expect(await getLastLineOffset(fileName, dataAppendLineCount)).toBe(
      data.length
    );
  });

  it(`the line is correct (${dataLineCount})`, async () => {
    expect(await getLineOffset(fileName, dataLineCount)).toBe(data.length);
  });
});

describe("Random offset of", () => {
  const fileName = "/tmp/1.txt";
  const dataLineCount = random(2, 5);
  const data = faker.lorem.lines(dataLineCount);

  const dataAppendLineCount = random(2, 5);
  const dataAppend = faker.lorem.lines(dataAppendLineCount);
  fs.writeFileSync(fileName, data + os.EOL + dataAppend);

  it(`the last line is correct (${dataAppendLineCount})`, async () => {
    expect(await getLastLineOffset(fileName, dataAppendLineCount)).toBe(
      data.length
    );
  });

  it(`the line is correct (${dataLineCount})`, async () => {
    expect(await getLineOffset(fileName, dataLineCount)).toBe(data.length);
  });
});

describe("Offset of", () => {
  const fileName = "/tmp/2.txt";
  const data = "ONE";

  const dataAppend = "TWOS";
  fs.writeFileSync(fileName, data + os.EOL + dataAppend);

  it("the line -1 is correct", async () => {
    expect(await getLastLineOffset(fileName, 1)).toBe(3);
  });

  it("the line +1 is correct", async () => {
    expect(await getLineOffset(fileName, 1)).toBe(3);
  });

  it("the line -0 is correct", async () => {
    expect(await getLastLineOffset(fileName, 0)).toBe(8);
  });

  it("the line +0 is correct", async () => {
    expect(await getLineOffset(fileName, 0)).toBe(0);
  });

  it("the line -1000 is correct", async () => {
    expect(await getLastLineOffset(fileName, 1000)).toBe(0);
  });

  it("the line +1000 is correct", async () => {
    expect(await getLineOffset(fileName, 1000)).toBe(8);
  });
});
