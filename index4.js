const XLSX = require("xlsx");
const express = require("express");
var fs = require("fs"),
  es = require("event-stream"),
  os = require("os");
// const ExcelJS = require('exceljs');
const mysqlConnection = require("./utils/database");
const app = express();

const content = fs.readFileSync("scripts/DEFLETTERS.txt");
const data = content.toString().split(/\r?\n/);
let descriptionData = [];

let letterBatchArr = [];
let filterByletter = data.map((info, i) => {
    let letterBatch = {}
  if (info.includes("3,6,2")) {
        // console.log(data[i + 1].split("|"))
          data[i + 1].split("|").map((ele, ind) => {
              if(ind === 0) {
                  letterBatch[`F${ind +1}`] = ele.split(" ")[ele.split(" ").length -1];
              } else {
                letterBatch[`F${ind +1}`] = ele
              }
          })
      letterBatchArr.push(letterBatch)
  }
});
// ghi_letter_batch_parameter

app.get("/", async (req, res) => {
  try {
    let flag = 0;
    let dataFlag = {};
    const mainData = descriptionData.reduce((acc, data, i) => {
      if (flag == 6) {
        dataFlag = { ...dataFlag, ...data };
        acc.push(dataFlag);
        dataFlag = {};
        flag = 0;
      } else {
        // console.log(flag);
        dataFlag = { ...dataFlag, ...data };
        flag += 1;
      }
      return acc;
    }, []);


    letterBatchArr.forEach((sendTodbdata, i) => {
        const sql = "INSERT INTO def_letter_batch_parameter SET ?";
        mysqlConnection.query(sql, sendTodbdata, (err, results, fields) => {
          if (!err) {
            console.log(results);
          } else {
            console.log(err);
          }
        });
    });
    // fs.writeFile("DEF.json", JSON.stringify(mainData), "utf8", () =>
    //   console.log("Done")
    // );

    res.json(letterBatchArr);
  } catch (err) {
    console.log(err);
  }
});

// PORT
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
