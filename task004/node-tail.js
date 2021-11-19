const yargs = require("yargs/yargs");

const { hideBin } = require("yargs/helpers");

const {
  stringWithPossiblePlusToInteger,
} = require("./string-with-possible-plus-to-integer.js");

const { tail } = require("./tail");

const argv = yargs(hideBin(process.argv))
  .detectLocale(false)
  .usage(
    "Usage: $0 [OPTION]... [FILE]...\n" +
      "Print the last 10 lines of each FILE to standard output.\n" +
      "With more than one FILE, precede each with a header giving the file name.\n\n"
  )
  .option("lines", {
    alias: "n",
    type: "string",
    default: 10,
    description:
      "Output the last NUM lines, instead of the last 10;\n" +
      "or use -n +NUM to output starting with line NUM",
  })
  .option("quiet", {
    alias: ["q", "silent"],
    type: "boolean",
    default: false,
    description: "Never output headers giving file names",
  })
  .command("$0 [files..]", "file list")
  .parserConfiguration({
    "short-option-groups": true,
    "parse-numbers": true,
  })
  .middleware(processParameterWithPossiblePlus).argv;

tail(argv.files, argv.lines, argv.quiet);
console.log(argv);

function processParameterWithPossiblePlus(arg) {
  if (!arg.lines) {
    return undefined;
  }

  const integerLines = stringWithPossiblePlusToInteger(arg.lines);
  if (isNaN(integerLines)) {
    console.error("ERROR: Lines argument is not a number");
    process.exit(1);
  }

  return { lines: integerLines, n: integerLines };
}
