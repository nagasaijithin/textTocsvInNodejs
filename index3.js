const XLSX = require("xlsx");
const express = require("express");
var fs = require("fs"),
  es = require("event-stream"),
  os = require("os");
const { parse } = require("path");
// const mysqlConnection = require("./utils/database");
const app = express();

const content = fs.readFileSync("scripts/GHILETTERS.txt");
const data = content.toString().split(/\r?\n/);
let descriptionData = [];

let letterNumberDic = {};
let key = "";
let filterByletter = data.map((info, i) => {
  if (info.includes("LETTER NUMBER:")) {
    info.split(":").map((row, index) => {
      if (index == 1) {
        key = row.split(" ")[1];
        // console.log(letterNumberDic, "letterOBj");
      }
      if (index == 2) {
        key = key + `_${row.replace(/\/()/g, "_")}`;
        letterNumberDic[key] = "";

        // letterNumberDic[key] = row;
      }
    });
    descriptionData.push(letterNumberDic);
  } else if (info.includes("LINE ")) {
    let flag = 3;
    // let string = ""
    if (data[i + flag] != undefined) {
      //   while (!data[i + flag].includes("The Wellfund, LLC ")) {
      while (!data[i + flag].includes(" MED 1 SOLUTIONS LLC ")) {
        if (data[i + flag].includes("END OF REPORT")) break;
        // console.log(key, "hello", letterNumberDic[key]);
        // if (letterNumberDic[key] !== "") {
        // console.log("triggering");
        // string += data[i + flag].toString()
        letterNumberDic[key] =
          letterNumberDic[key] + "\n" + data[i + flag].toString();
        // }
        flag++;
      }
      //   console.log(
      //     "mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm"
      //   );
    }
  }
});
// console.log(letterNumberDic);

let addingTag = Object.keys(letterNumberDic).map((data, i) => {
  let template = `
    <html>
<h1>
LETTER NUMBER: ${data}
</h1>
<p>
${letterNumberDic[data].replace(/</g, "'").replace(/>/g, "'")}
</p>
<hr />
    </html>
    `;
  template =
    "<p>" +
    template.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") +
    "</p>";
  //   fs.write();
  fs.writeFileSync(`${__dirname}/GHI/${data}.html`, template, (err) => {
    if (err) throw err;

    console.log("filed saved!");
  });
  return template;
  //   return
});
// console.log(addingTag[0]);
app.get("/", async (req, res) => {
  let str = "";
  addingTag.map((htmlEle, i) => {
    return (str += htmlEle);
  });

  res.send(str);
});

// PORT
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
