const XLSX = require("xlsx");
const express = require("express");
var fs = require("fs"),
  es = require("event-stream"),
  os = require("os");
// const ExcelJS = require('exceljs');
const mysqlConnection = require("./utils/database");
const app = express();

const content = fs.readFileSync("scripts/GHILETTERS.txt");
const data = content.toString().split(/\r?\n/);
let descriptionData = [];

let filterByletter = data.map((info, i) => {
  let letterNumberDic = {};
  if (info.includes("LETTER NUMBER:")) {
    info.split(":").map((row, index) => {
      if (index == 1) {
        letterNumberDic.LETTERNUMBER = row.split(" ")[1];
      }
      if (index == 2) {
        letterNumberDic.LETTERDESCRIPTION = row;
      }
    });
    descriptionData.push(letterNumberDic);
  } else if (
    info.includes("FORM LENGTH:") ||
    info.includes("KEYED NOTES:") ||
    info.includes("COMMAND PROCEDURE:") ||
    info.includes("FORM NUMBER:") ||
    info.includes("MINIMUM ACCOUNT BALANCE:")
  ) {
    // console.log(info.split(":"));
    info.split(":").map((row, index) => {
      if (index == 1) {
        info.includes("FORM LENGTH:")
          ? (letterNumberDic.FORMLENGTH = row.split(" ")[1])
          : info.includes("KEYED NOTES:")
          ? (letterNumberDic.PL95 = row.split(" ")[1])
          : info.includes("COMMAND PROCEDURE:")
          ? (letterNumberDic.COMMANDPROCEDURE = row.split(" ")[1])
          : info.includes("FORM NUMBER:")
          ? (letterNumberDic.FORMNUMBER = row.split(" ")[1])
          : info.includes("MINIMUM ACCOUNT BALANCE:")
          ? (letterNumberDic.MINIMUMACCOUNTBALANCE = row.split(" ")[1])
          : null;
      }
      if (index == 2) {
        info.includes("FORM LENGTH:")
          ? (letterNumberDic.BLANKLINESATTOP = row.split(" ")[1])
          : info.includes("KEYED NOTES:")
          ? (letterNumberDic.KEYEDNOTES = row.split(" ")[1])
          : info.includes("COMMAND PROCEDURE:")
          ? (letterNumberDic.LETTERSELECTIONGROUP = row.split(" ")[1])
          : info.includes("FORM NUMBER:")
          ? (letterNumberDic.OFCOPIES = row.split(" ")[1])
          : info.includes("MINIMUM ACCOUNT BALANCE:")
          ? (letterNumberDic.PRINTDEVICE = row.split(" ")[1])
          : null;
      }
      if (index == 3) {
        info.includes("FORM LENGTH:")
          ? (letterNumberDic.LEFTMARGIN = row)
          : info.includes("KEYED NOTES:")
          ? (letterNumberDic.ADDRESSTYPE = row)
          : info.includes("COMMAND PROCEDURE:")
          ? (letterNumberDic.MINIMUMDOLLARTOSEND = row.split(" ")[1])
          : info.includes("FORM NUMBER:")
          ? (letterNumberDic.FORMTYPE = row.split(" ")[1])
          : info.includes("MINIMUM ACCOUNT BALANCE:")
          ? (letterNumberDic.DAYSAFTERINTIALPL95 = row.split(" ")[1])
          : null;
      }
    });
    descriptionData.push(letterNumberDic);
  } else if (info.includes("PRINT FILTER:")) {
    info.split(":").map((row, index) => {
      info.includes("PRINT FILTER:")
        ? (letterNumberDic.PRINTFILTER = row.split(" ")[1])
        : null;
    });
    descriptionData.push(letterNumberDic);
  }
});

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
    // const sql =
    // "SET @LETTERNUMBER = ?;SET @LETTERDESCRIPTION = ?;SET @FORMLENGTH = ?;SET @BLANKLINESATTOP = ?;SET @LEFTMARGIN = ?;SET @PL95 = ?;SET @KEYEDNOTES = ?;SET @ADDRESSTYPE = ?;SET @COMMANDPROCEDURE = ?;SET @LETTERSELECTIONGROUP = ?;SET @MINIMUMDOLLARTOSEND = ?;SET @FORMNUMBER = ?;SET @OFCOPIES = ?;SET @FORMTYPE = ?;SET @MINIMUMACCOUNTBALANCE = ?;SET @PRINTDEVICE = ?;SET @DAYSAFTERINTIALPL95 = ?;SET @PRINTFILTER = ?; CALL Add_or_Update_QB(@LETTERNUMBER, @LETTERDESCRIPTION, @FORMLENGTH, @BLANKLINESATTOP, @LEFTMARGIN, @PL95, @KEYEDNOTES, @ADDRESSTYPE, @COMMANDPROCEDURE,@LETTERSELECTIONGROUP,@MINIMUMDOLLARTOSEND,@FORMNUMBER,@OFCOPIES,@FORMTYPE,@MINIMUMACCOUNTBALANCE,@PRINTDEVICE,@DAYSAFTERINTIALPL95,@PRINTFILTER);";

    mainData.forEach((sendTodbdata, i) => {
      const sql = "INSERT INTO ghi_test_table SET ?";
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

    res.json(mainData);
  } catch (err) {
    console.log(err);
  }
});

// PORT
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
