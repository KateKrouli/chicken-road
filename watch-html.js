const chokidar = require("chokidar");
const fs = require("fs");
const posthtml = require("posthtml");
const include = require("posthtml-include");

function buildHtml() {
  const html = fs.readFileSync("src/index.html", "utf8");
  posthtml([include({ root: "./src/components" })])
    .process(html)
    .then(result => {
      fs.writeFileSync("dist/index.html", result.html);
      console.log("✅ dist/index.html updated");
    })
    .catch(err => console.error(err));
}

console.log("👀 Watching HTML files…");
chokidar.watch("src/**/*.html", { ignoreInitial: true })
  .on("all", (ev, path) => {
    console.log(`🔁 (${ev}) ${path}`);
    buildHtml();
  });