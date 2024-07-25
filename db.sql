CREATE DATABASE book
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

-- main tables

CREATE TABLE public.books
(
    id serial NOT NULL,
    isbn character varying(12) NOT NULL,
    title text,
    country text,
    area text,
    PRIMARY KEY (id),
);

ALTER TABLE IF EXISTS public.books
    OWNER to postgres;

CREATE TABLE public.countries
(
    id serial NOT NULL,
    country_code character(2),
    country_name character varying(100),
    PRIMARY KEY (id),
);

ALTER TABLE IF EXISTS public.countries
    OWNER to postgres;

CREATE TABLE public.notes
(
    id serial NOT NULL,
    content text,
    PRIMARY KEY (id),
);

ALTER TABLE IF EXISTS public.notes
    OWNER to postgres;    

CREATE TABLE public.records
(
    id serial NOT NULL,
    book_id integer NOT NULL,
    read_date date,
    recommendation integer,
    summary text,
    note_id integer,
    amazon_url text,
    PRIMARY KEY (id),
	FOREIGN KEY(book_id) REFERENCES books(id)
);

ALTER TABLE IF EXISTS public.records
    OWNER to postgres;

--setting tables

CREATE TABLE public.codemst
(
    id serial NOT NULL,
    code_type character varying(30),
    PRIMARY KEY (id),
);

ALTER TABLE IF EXISTS public.codemst
    OWNER to postgres;    

CREATE TABLE public.codedtl
(
    id serial NOT NULL,
    mst_id integer,
    display character varying(30),
    value character varying(2),
    PRIMARY KEY (id),
    FOREIGN KEY (mst_id) REFERENCES codemst(id)
);

ALTER TABLE IF EXISTS public.codedtl
    OWNER to postgres;

-- add data

INSERT INTO books(isbn, title, country, area) VALUES ('4770007019','Botchan ','JP','Ehime');
INSERT INTO books(isbn, title, country, area) VALUES ('1551926679','Harry Potter and the Philosopher''s Stone','GB','London');

INSERT INTO codemst(code_type) VALUES ('bookSortOptions');

INSERT INTO codedtl(mst_id, display, value) VALUES (1, 'Title', 'T');
INSERT INTO codedtl(mst_id, display, value) VALUES (1, 'Latest', 'L');
INSERT INTO codedtl(mst_id, display, value) VALUES (1, 'Favorite', 'F');

INSERT INTO records(book_id, read_date, recommendation, summary, note_id, amazon_url) VALUES 
(1, '2024-07-20', '8', 
'Botchan, a timeless Japanese satire novel written by Japan''s most beloved novelist, Soseki Natsume. As a teacher, the protagonist from a big city is relocated to a countryside town. He finds out his colleagues are hypocrites, but he decides to fight against them. The protagonist often takes a train and enjoys the hot spring, Dogo Onsen in Ehime. Now tourists can find a memorial clock in front of the Dogo train station in Ehime of Japan.', 
 '1', 
 'https://www.amazon.com/-/zh_TW/Soseki-Natsume/dp/4805312637/ref=sr_1_3?crid=1GKPIK7LD2GK7&dib=eyJ2IjoiMSJ9.YOm2jemJ5StIzZXqX7FE4rVH0F4U9QU4_N_euvj6vHMMCqfcsS01wQKrdfoAG9hoSnvK3acKWJ1_hPQCpmQ922OF3uozf1LbQ_6Hj42ScdKXuD1wkZ_i629xwgOD1olvUvAoSE7sVXUd6j0O-nZUWeItBnTj1N_F6qvRv6TG7rTCa64n9Rmd0m2Y6IpvfwA0VcWtOfCGMNMjzEFwKD_IYULVSLGYjqpW44LM8E5LSiy9ckUolwwYpV61psN5oJxV4PPtGMnkGmg8wxSMl0G2B77SHgp6WYxLqAIoKXt6wjM.Co66Ffc8AjTtVW4-zGUQvnfrRGgfgorUroxj_HI9juE&dib_tag=se&keywords=botchan&qid=1721443590&sprefix=Botchan%2Caps%2C247&sr=8-3');
 INSERT INTO records(book_id, read_date, recommendation, summary, note_id, amazon_url) VALUES 
(2, '2024-07-21', '7', 'Harry Potter receives mysterious letters on his doorstep. He was invited to study in Hogwarts School of Witchcraft and Wizardry. At school, he find the secret of the Philosopher''s Stone and protects it from abuse by evil Lord Voldemort. Harry Potter starts his journey from the Platform Nine and Three-Quarters in the King''s Cross Railway Station. Tourists can find the memorial signs in the train station.', 
 '1', 
 'https://www.amazon.com/-/zh_TW/Rowling-J-K/dp/1408894629/ref=sr_1_8?crid=3SG8H2VI62WUQ&dib=eyJ2IjoiMSJ9.Q2sO83gVE3Jf8UHZOH83s1gzJxB9OCdO84gGC5SsT4CdueN2FqPgk2jRR_iwo6XEO-ojbA1e-zvJFR7mfoslqmZ13PG1ZtOMpRsgwgn033tna5lDxCe1UBuos3jw-28jKLitMvXiJ6X3RXvLJfeOaZ_xXlCtOkZeyZ-aFTCQk_WWMG7FMQXRoUzuBCZeaSnH5xpk-kkLQGUPkUn7_bpyxiZiYFMOe4YQTAVFYEzXZAVg1smux3TbGla1R0YikfJjIuvAixKiC1zfbZl4G0YdUl_8NoWLJSAkn0fFBLuFbCI.tO1G6JO2_qYr-HEJ0If98Oxx6Fm06l-ILxpFYNd3RyI&dib_tag=se&keywords=harry+potter+and+the+philosopher%27s+stone&qid=1721548204&sprefix=Harry+Potter+and+the+Philosopher%27s+Stone%2Caps%2C465&sr=8-8');

 INSERT INTO notes(content) VALUES ('Readers can learn the dark side of human nature and how to handle it in the complicated society. I plan to visit Ehime in the autumn this year. I hope I can feel more meanings about the fiction at that time.');