const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const session = require("express-session");
const urlencodedParser = bodyParser.urlencoded({extended: false});
const app = express();
app.set("view engine", "ejs");
app.use(express.static("./public"));

const connection =  mysql.createConnection({
    multipleStatements: true,
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "pastebin"
});

//P.S. You may use and edit these functions. They are here for a reason :)
function generateUUID(){
    let generate = "";
    const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    for ( var i = 0; i < length; i++ ) {
        generate += char.charAt(Math.floor(Math.random() * char.length));
    }
    checkExists(generate);
    return generate;
}

function checkExists(code){
    connection.query("SELECT * FROM accounts WHERE uuid = '"+code+"'", (err, response) => {
        if (err) throw err;
        if (length(response) > 0){
            return code;
        }else{
            generateUUID();
        }
    })
}

app.use(session({
    secret: "Ch43y0Vn6Num84W4N",
    saveUninitialized: true,
    resave: true
}));
//write you code here
//Good luck!





app.listen(3000);


