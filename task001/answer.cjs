const EventEmitter = require("events");

class Answer extends EventEmitter {
  constructor() {
    super();
    this.value = "";

    this.on("hello", () => {
      this.value = "Hello!";
    });

    this.on("howAreYou", () => {
      this.value = "I am fine.";
    });

    this.on("whatAreYouDoing", () => {
      this.value = "I'm working now.";
    });
  }
}

module.exports = Answer;
