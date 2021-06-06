const express = require('express');
const path = require('path');
const PythonShell = require('python-shell').PythonShell;
const app = express();
const port = 3000;

app.use(express.static("./"));
app.use(express.json());


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

//An endpoint to scrape pinterest image urls and returns them to the client
//TODO: Rewrite the scraper in javascript to improve performance
app.post("/scraper", function(req,res) {
    let boardURL = req.body["url"];
    PythonShell.run("src/scraper/scraper.py", {pythonPath: "venv/Scripts/python.exe",args: [boardURL]}, function (err, results) {
        if (err) {
            throw err;
        }

        res.json({"links": results});
    })
})


app.listen(port, function () {
    console.log("Example app listening at http://localhost:" + port);
});
