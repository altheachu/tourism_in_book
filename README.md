# Purpose
A website based on node.js for users to find fictions with my reading notes related to one certain country. It supports both graphic and search bar operation. Also, users can find the covers of the books through [Open Library Covers API](https://openlibrary.org/dev/docs/api/covers)     

# Usage

After downloading the repository, you can install related modules through the terminal by doing
  
	npm install

# Database Setting

You will need to create tables and add data by using pgAdmin4. The postgreSQL syntax can be found in file 'db.sql' inside the root directory. Also, the data of table 'countries' should be imported from the file 'countries.csv' into into the database.

The database diagram can be overviewed in the file 'database_diagram.jpg'.

# Start up

You can start up this application through the terminal by doing

	nodemon index.js

If it is started up successfully, you can view the UI as the screenshots below shows at 

	http://localhost:3000/

![UI screenshot - index](/public/imgs/screenshot_index.jpg "UI screenshot - index")
![UI screenshot - article list](/public/imgs/screenshot_articles.jpg "UI screenshot - article list")
![UI screenshot - note](/public/imgs/screenshot_note.jpg "UI screenshot - note")

# Contact

Althea Chu - [@Althea (Chia-Hsuan) Chu](https://www.linkedin.com/in/althea-chu-24966291/) - aehtla2012@gmail.com

Project Link: [https://github.com/altheachu/tourism_in_book](https://github.com/altheachu/tourism_in_book)