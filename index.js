import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/changeTab", (req, res) => {
  const currentTab = req.body.tab;

  if (currentTab === "text"){
    res.render("thought.ejs");
  } else {
    res.render("index.ejs");
  }
});

app.get("/note/1", (req, res) => {
  res.render("note.ejs");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
