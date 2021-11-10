const fs = require("fs");
const Mustache = require("mustache");
const path = require("path");

function template(bufferTemplate, bufferData, outputPath) {
  let sTemplate = bufferTemplate.toString();
  let data = JSON.parse(bufferData.toString());
  const rendered = Mustache.render(sTemplate, data, {
    method:
      "<strong>{{name}}</strong>" +
      "(<ul class='param'>{{#param}}{{> field}}{{/param}}</ul>)" +
      "{{#return}}: {{.}}{{/return}};<br/>\n",
    field: "<li><span>{{name}}</span>{{#class}}: {{.}}{{/class}}</li>\n",
  });
  return fs.promises.writeFile(outputPath, rendered);
}

function createHtml(dataPath, templatePath, outputPath, callback) {
  let bufferData = "";
  let bufferTemplate = "";
  fs.promises
    .readFile(dataPath)
    .catch((errData) => callback(errData))
    .then((data1) => {
      bufferData = data1;
    })
    .then(() => fs.promises.readFile(templatePath))
    .catch((errTemplate) => callback(errTemplate))
    .then((data2) => {
      bufferTemplate = data2;
    })
    .then(() => {
      return template(bufferTemplate, bufferData, outputPath);
    })
    .catch((err) => {
      callback(err);
    })
    .finally(() => callback());
}

createHtml(
  path.resolve(__dirname, "data.json"),
  path.resolve(__dirname, "template.html"),
  path.resolve(__dirname, "build.html"),
  (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Done");
    }
  }
);
