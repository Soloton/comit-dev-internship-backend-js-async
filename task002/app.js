const fs = require("fs");
const Mustache = require("mustache");
const path = require("path");

function createHtml(dataPath, templatePath, outputPath, callback) {
  fs.readFile(dataPath, (errData, textData) => {
    if (errData) {
      callback(errData);
    } else {
      fs.readFile(templatePath, (errTemplate, textTemplate) => {
        if (errTemplate) {
          callback(errTemplate);
        } else {
          let template = textTemplate.toString();
          let data = JSON.parse(textData.toString());
          const rendered = Mustache.render(template, data, {
            method:
              "<strong>{{name}}</strong>" +
              "(<ul class='param'>{{#param}}{{> field}}{{/param}}</ul>)" +
              "{{#return}}: {{.}}{{/return}};<br/>\n",
            field:
              "<li><span>{{name}}</span>{{#class}}: {{.}}{{/class}}</li>\n",
          });
          fs.writeFile(outputPath, rendered, callback);
        }
      });
    }
  });
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
