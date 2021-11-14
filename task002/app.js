const fs = require("fs");
const Mustache = require("mustache");
const path = require("path");

async function template(bufferTemplate, bufferData, outputPath) {
  let sTemplate = bufferTemplate.toString();
  let data = JSON.parse(bufferData.toString());
  const rendered = Mustache.render(sTemplate, data, {
    method:
      "<strong>{{name}}</strong>" +
      "(<ul class='param'>{{#param}}{{> field}}{{/param}}</ul>)" +
      "{{#return}}: {{.}}{{/return}};<br/>\n",
    field: "<li><span>{{name}}</span>{{#class}}: {{.}}{{/class}}</li>\n",
  });
  await fs.promises.writeFile(outputPath, rendered);
}

async function createHtml(dataPath, templatePath, outputPath) {
  let bufferData = await fs.promises.readFile(dataPath);
  let bufferTemplate = await fs.promises.readFile(templatePath);
  await template(bufferTemplate, bufferData, outputPath);
}

createHtml(
  path.resolve(__dirname, "data.json"),
  path.resolve(__dirname, "template.html"),
  path.resolve(__dirname, "build.html")
)
  .catch((err) => console.error(err))
  .finally(() => console.log("Done"));
