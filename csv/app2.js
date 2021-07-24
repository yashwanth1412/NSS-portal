const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const fastcsv = require("fast-csv");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
});
app.post("/",function(req,res){
let dropArea = document.getElementById("drop-area");

["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
e.preventDefault();
e.stopPropagation();
}

["dragenter", "dragover"].forEach((eventName) => {
dropArea.addEventListener(eventName, highlight, false);
});

["dragleave", "drop"].forEach((eventName) => {
dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener("drop", handleDrop, false);

}
function handleDrop(e) {
  let dt = e.dataTransfer;
  let files = dt.files;

  handleFiles(files);
  DownloadFile(files);

}

function handleFiles(files) {
  [...files].forEach(uploadFile);
}


function uploadFile(file) {
  let url = "YOUR URL HERE";
  let formData = new FormData();

  formData.append("file", file);

  fetch(url, {
    method: "POST",
    body: formData
  })
    .then(() => {
      /* Done. Inform the user */
    })
    .catch(() => {
      /* Error. Inform the user */
    });
}

function DownloadFile(fileName) {
    //Set the File URL.
    var url = "Files/" + fileName;

    //Create XMLHTTP Request.
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "blob";
    req.onload = function () {
        //Convert the Byte Data to BLOB object.
        var blob = new Blob([req.response], { type: "application/octetstream" });

        //Check the Browser type and download the File.
        var isIE = false || !!document.documentMode;
        if (isIE) {
            window.navigator.msSaveBlob(blob, fileName);
        } else {
            var url = window.URL || window.webkitURL;
            link = url.createObjectURL(blob);
            var a = document.createElement("a");
            a.setAttribute("download", fileName);
            a.setAttribute("href", link);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };
    req.send();
};
