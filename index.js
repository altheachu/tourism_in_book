import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import path from "path";
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

async function getCountryNameList(){
  let countryNameList = [];
  try {
    const sql = "SELECT country_name FROM countries";
    const result = await db.query(sql); 
    result.rows.forEach((row) => {
      countryNameList.push(row.country_name);
    });
  } catch(error){
    console.log(`fail to find countryNameList: ${error}`);
  }
  return countryNameList;
}

async function getCodeNameList(){
  let codeNameList = [];
  try {
    const sql = "SELECT country_code || '|' || country_name as code_name_item FROM countries";
    const result = await db.query(sql); 
    result.rows.forEach((row) => {
      codeNameList.push(row.code_name_item);
    });
  } catch(error){
    console.log(`fail to find codeNameList: ${error}`);
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
      const countryNames = await getCountryNameList();
      const querySql = "select id, book_id, read_date, recommendation, summary, note_id, " + 
      "amazon_url, isbn, $1||isbn||'-'||$2||'.jpg' as img_url, title, location, " + 
      "TO_CHAR(read_date, 'YYYY-MM-DD') as read_date_str from records r inner join " +
      "(select b.id as tmp_book_id, b.isbn, b.title, c.country_name || ', ' || b.area as location " +
      "from books b inner join countries c on b.country = c.country_code) t " + 
      "on t.tmp_book_id = r.book_id order by t.title";
      const result = await db.query(querySql, [API_URL,'M']);
      const rtnObj = {
        articles: result.rows,
        bookSortOptions: bookSortOptions,
        countryNames: countryNames,
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
    const countryNames = await getCountryNameList();
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
      bookSortOptions: bookSortOptions,
      countryNames: countryNames,
    }
    res.render("thought.ejs", rtnObj);
  } catch (error){
    console.log(error);
  }
});

app.post("/searchArticles", async (req, res) => {
  const bookSortOptions = await getBookSortOptions();
  const countryNames = await getCountryNameList();
  const title = req.body.title;
  const country = req.body.country;
  const sort = req.body.sort;

  let querySql = "select id, book_id, read_date, recommendation, summary, note_id, " + 
  "amazon_url, isbn, $1||isbn||'-'||$2||'.jpg' as img_url, title, location, " + 
  "TO_CHAR(read_date, 'YYYY-MM-DD') as read_date_str from records r inner join " +
  "(select b.id as tmp_book_id, b.isbn, b.title, c.country_name, c.country_name || ', ' || b.area as location " +
  "from books b inner join countries c on b.country = c.country_code ";
  let sqlParams = [API_URL,'M'];

  if(title || country){
    querySql += "where ";
    
    if(title) {
      querySql += "b.title like '%'||$3||'%' "
      sqlParams.push(title);
    } else {
      querySql += "1=$3 ";
      sqlParams.push("1");
    }

    if(country){
      querySql += "and c.country_name like '%'||$4||'%' "
      sqlParams.push(country);
    }
  }

  querySql += ") t on t.tmp_book_id = r.book_id";

  if(sort){
    querySql += " order by"
    switch(sort){
      case 'L':
        querySql += " read_date desc";
        break;  
      case 'F':
        querySql += " recommendation desc";
        break;
      default:
        querySql += " title";
        break;   
    }
  }
  const result = await db.query(querySql, sqlParams);
  const rtnObj = {
    articles: result.rows,
    bookSortOptions: bookSortOptions,
    countryNames: countryNames,
  }
  res.render("thought.ejs", rtnObj);
});

app.get("/note/:id", async (req, res) => {
  const note_id = req.params.id;
  const querySql = "select *, $1||isbn||'-'||$2||'.jpg' as img_url from books b inner join " + 
  "(select n.content as note, r.book_id, TO_CHAR(r.read_date, 'YYYY-MM-DD') as read_date_str , " + 
  "r.recommendation, r.summary, r.amazon_url from notes n inner join records r " + 
  "on n.id = r.note_id where n.id = $3) t on b.id = t.book_id";
  const result = await db.query(querySql, [API_URL,'M', note_id]);
  let article;
  if(result.rows.length > 0){
    article = result.rows[0];
  }
  const rtnObj = {
    article: article,
  }
  res.render("note.ejs", rtnObj);
});

app.get("/searchArticles", async (req, res) => {
  try {
    const bookSortOptions = await getBookSortOptions();
    const countryNames = await getCountryNameList();
    const querySql = "select id, book_id, read_date, recommendation, summary, note_id, " + 
    "amazon_url, isbn, $1||isbn||'-'||$2||'.jpg' as img_url, title, location, " + 
    "TO_CHAR(read_date, 'YYYY-MM-DD') as read_date_str from records r inner join " +
    "(select b.id as tmp_book_id, b.isbn, b.title, c.country_name || ', ' || b.area as location " +
    "from books b inner join countries c on b.country = c.country_code) t " + 
    "on t.tmp_book_id = r.book_id order by t.title";
    const result = await db.query(querySql, [API_URL,'M']);
    const rtnObj = {
      articles: result.rows,
      bookSortOptions: bookSortOptions,
      countryNames: countryNames,
    }
    res.render("thought.ejs", rtnObj);
  } catch (error){
    console.log(error);
  }
});

app.get("/test", async (req, res) => {
  try {
    console.log('test');
    // const imagePath = path.resolve("C:/html_side_project/tourism_in_book", 'public', 'imgs', 'src.jpeg');
    // res.sendFile(imagePath);
    try {
      console.log('test');
      // 下載外部圖片
      const response = await axios.get("https://sive.rs/images/book/NegotiateAnything.webp", { responseType: 'arraybuffer' });
      const imageBuffer = Buffer.from(response.data, 'binary');
      
      // 設置回應的Content-Type為圖片的MIME類型
      res.set('Content-Type', response.headers['content-type']);
      res.send(imageBuffer);
    } catch (error) {
      console.log(error);
      res.status(500).send('Error occurred');
    }
  } catch (error){
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
});

