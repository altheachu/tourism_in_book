import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const API_URL = "https://covers.openlibrary.org/b/isbn/";
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "book",
  password: "1234",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static("public"));

app.get("/", async (req, res) => {
  let codeNameList = []
  const result = await db.query("SELECT * FROM countries"); 
  result.rows.forEach((row) => {
    let codeNameItem = row.country_code + "|" + row.country_name;
    codeNameList.push(codeNameItem);
  });
  res.render("index.ejs", 
    {codeNameList: codeNameList}
  );
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

app.get("/back", (req, res) => {
  res.render("thought.ejs");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});
