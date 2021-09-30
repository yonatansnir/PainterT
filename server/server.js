// Run  `V=31 node server.js` for specific version or just type `node server.js`. 
// I thoughted to manage the version number of the build in a separate file on the system for CI/CD.
// Usually, I separate services to separate files but because it is a very small app I did it this way. 

const express = require("express");
const path = require("path");
const app = express();
let images = require("./images.json");

let version = process.env.V || new Date().getTime();

app.use(express.json({ limit: "50mb" }));
app.use("/", express.static(path.join(__dirname + "/../client")));

app.get("/v", (req, res) => {
    res.json({ version });
})

app.get("/images", (req, res) => {
    res.json(images);
})

app.post("/images", (req, res) => {
    images.push({ src: req.body.src });
    res.json({ src: req.body.src });
})

app.delete("/images", (req, res) => {
    images = [];
    res.json(images);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. \nhttp://localhost:${PORT}/`);
});