const fs = require("fs");
const faker = require("faker");
const {
  getLastLineOffset,
  getLineOffset,
  getLastLines,
  getLines,
  tailOneFile,
} = require("../tail");

function random(min, max) {
  return Math.trunc(Math.random() * (max - min + 1)) + min;
}

function checkOffset(
  fileName,
  data,
  dataAppend,
  dataAppendLineCount,
  dataLineCount
) {
  fs.writeFileSync(fileName, `${data}\n${dataAppend}`);

  it(`the last line is correct (${dataAppendLineCount})`, async () => {
    expect(await getLastLineOffset(fileName, dataAppendLineCount)).toBe(
      data.length + 1
    );
  });

  it(`the line is correct (${dataLineCount})`, async () => {
    expect(await getLineOffset(fileName, dataLineCount)).toBe(data.length);
  });
}

describe("TAIL", () => {
  describe("Const offset of", () => {
    const fileName = "/tmp/0.txt";
    const dataLineCount = random(2, 5);
    const data = `${"*".repeat(9)}\n`.repeat(dataLineCount).slice(0, -1);

    const dataAppendLineCount = random(2, 5);
    const dataAppend = `${"*".repeat(9)}\n`
      .repeat(dataAppendLineCount)
      .slice(0, -1);
    checkOffset(fileName, data, dataAppend, dataAppendLineCount, dataLineCount);
  });

  describe("Random offset of", () => {
    const fileName = "/tmp/1.txt";
    const dataLineCount = random(2, 5);
    const data = faker.lorem.lines(dataLineCount);

    const dataAppendLineCount = random(2, 5);
    const dataAppend = faker.lorem.lines(dataAppendLineCount);
    checkOffset(fileName, data, dataAppend, dataAppendLineCount, dataLineCount);
  });

  describe("Offset of", () => {
    const fileName = "/tmp/2.txt";
    const data = "ONE";

    const dataAppend = "TWOS";
    fs.writeFileSync(fileName, `${data}\n${dataAppend}`);

    it("the line -1 is correct", async () => {
      expect(await getLastLineOffset(fileName, 1)).toBe(4);
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

  });

  describe("Tail one line", () => {
    const fileName = "/tmp/5.txt";
    const dataLineCount = random(2, 50);
    const data = faker.lorem.lines(dataLineCount);

    const dataAppendLineCount = random(2, 50);
    const dataAppend = faker.lorem.lines(dataAppendLineCount);
    fs.writeFileSync(fileName, `${data}\n${dataAppend}`);

    it("value (0) is valid", async () => {
      expect(await tailOneFile(fileName, 0)).toBe("");
    });

    it(`value (${-dataAppendLineCount}) is valid`, async () => {
      expect(await tailOneFile(fileName, -dataAppendLineCount)).toBe(
        dataAppend
      );
    });

    it(`value (${dataLineCount}) is valid`, async () => {
      expect(await tailOneFile(fileName, dataLineCount)).toBe(data);
    });
  });

  describe("CONST Tail one line", () => {
    const fileName = "/tmp/01.txt";

    it("value (-0) is valid", async () => {
      expect(await tailOneFile(fileName, -0)).toBe("");
    });

    it("value (-1) is valid", async () => {
      expect(await tailOneFile(fileName, -1)).toBe("5*********");
    });

    it("value (-2) is valid", async () => {
      expect(await tailOneFile(fileName, -2)).toBe(`4*********
5*********`);
    });

    it("value (-3) is valid", async () => {
      expect(await tailOneFile(fileName, -3)).toBe(`3*********
4*********
5*********`);
    });

    it("value (-4) is valid", async () => {
      expect(await tailOneFile(fileName, -4)).toBe(`2*********
3*********
4*********
5*********`);
    });

    it("value (-5) is valid", async () => {
      expect(await tailOneFile(fileName, -5)).toBe(`1*********
2*********
3*********
4*********
5*********`);
    });

    it("value (-6) is valid", async () => {
      expect(await tailOneFile(fileName, -6)).toBe(`1*********
2*********
3*********
4*********
5*********`);
    });

    it(`value (${0}) is valid`, async () => {
      expect(await tailOneFile(fileName, 0)).toBe("");
    });

    it(`value (${1}) is valid`, async () => {
      expect(await tailOneFile(fileName, 1)).toBe("1*********");
    });

    it(`value (${2}) is valid`, async () => {
      expect(await tailOneFile(fileName, 2)).toBe(`1*********
2*********`);
    });

    it(`value (${3}) is valid`, async () => {
      expect(await tailOneFile(fileName, 3)).toBe(`1*********
2*********
3*********`);
    });

    it(`value (${4}) is valid`, async () => {
      expect(await tailOneFile(fileName, 4)).toBe(`1*********
2*********
3*********
4*********`);
    });

    it(`value (${5}) is valid`, async () => {
      expect(await tailOneFile(fileName, 5)).toBe(`1*********
2*********
3*********
4*********
5*********`);
    });

    it(`value (${6}) is valid`, async () => {
      expect(await tailOneFile(fileName, 6)).toBe(`1*********
2*********
3*********
4*********
5*********`);
    });
  });
});
