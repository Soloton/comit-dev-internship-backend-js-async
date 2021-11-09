const Answer = require("../answer");

describe("Answer: ", () => {
  let answer;

  beforeEach(() => {
    answer = new Answer();
  });

  test("should to reply 'Hello!' to the hello event", () => {
    answer.emit("hello");

    expect(answer.value).toBe("Hello!");
  });

  test("should to reply 'I am fine.' to the howAreYou event", () => {
    answer.emit("howAreYou");

    expect(answer.value).toBe("I am fine.");
  });

  test("should to reply 'I'm working now.' to the whatAreYouDoing event", () => {
    answer.emit("whatAreYouDoing");

    expect(answer.value).toBe("I'm working now.");
  });
});
