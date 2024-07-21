import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;
const API_URL = `https://covers.openlibrary.org/b/isbn/`;
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

async function getCodeNameList(){
  let codeNameList = [];
  try {
    const sql = "SELECT country_code || '|' || country_name as code_name_item FROM countries";
    const result = await db.query(sql); 
    result.rows.forEach((row) => {
      codeNameList.push(row.code_name_item);
    });
  } catch(error){
    console.log(`fail to find codeNameMap: ${error}`);
  }
  return codeNameList;
}

async function getBookSortOptions(){
  let options = [];
  try {
    const sql = "select * from codedtl where mst_id = " + 
    "(select id from codemst where code_type = 'bookSortOptions')";
    const result = await db.query(sql);
    result.rows.forEach((row) => {
      let option = {
        display: row.display,
        value: row.value,
      }
      options.push(option);
    });
  } catch(error){
    console.log(`fail to find bookSortOptions: ${error}`);
  }
  return options;
}

app.get("/", async (req, res) => {
  let codeNameList = await getCodeNameList();
  res.render("index.ejs", 
    {codeNameList: codeNameList}
  );
});

app.post("/changeTab", async (req, res) => {
  try {
    const currentTab = req.body.tab;
    if (currentTab === "text"){
      const bookSortOptions = await getBookSortOptions();
      const querySql = "select id, book_id, read_date, recommendation, summary, note_id, " + 
      "amazon_url, isbn, $1||isbn||'-'||$2||'.jpg' as img_url, title, location, " + 
      "TO_CHAR(read_date, 'YYYY-MM-DD') as read_date_str from records r inner join " +
      "(select b.id as tmp_book_id, b.isbn, b.title, c.country_name || ', ' || b.area as location " +
      "from books b inner join countries c on b.country = c.country_code) t " + 
      "on t.tmp_book_id = r.book_id order by t.title";
      const result = await db.query(querySql, [API_URL,'M']);
      console.log(result.rows);
      const rtnObj = {
        articles: result.rows,
        bookSortOptions: bookSortOptions,
      }
      res.render("thought.ejs", rtnObj);
    } else {
      let codeNameList = await getCodeNameList();
      res.render("index.ejs", 
        {codeNameList: codeNameList}
      );
    }
  } catch(error){
    console.log(error);
  }
});

app.post("/thought", async(req, res) => {
  try {
    const bookSortOptions = await getBookSortOptions();
    const countryCode = req.body.countryCode;
    const querySql = "select id, book_id, read_date, recommendation, summary, note_id, " + 
    "amazon_url, isbn, $1||isbn||'-'||$2||'.jpg' as img_url, title, location, " + 
    "TO_CHAR(read_date, 'YYYY-MM-DD') as read_date_str from records r inner join " +
    "(select b.id as tmp_book_id, b.isbn, b.title, c.country_name || ', ' || b.area as location " +
    "from books b inner join countries c on b.country = c.country_code where b.country = $3) t " + 
    "on t.tmp_book_id = r.book_id order by t.title";
    const result = await db.query(querySql, [API_URL,'M', countryCode]);
    const rtnObj = {
      articles: result.rows,
      bookSortOptions: bookSortOptions
    }
    res.render("thought.ejs", rtnObj);
  } catch (error){
    console.log(error);
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

