const mysql = require('mysql2');
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'userdb'
});
db.connect((err) => {
    if (err) throw err;
    console.log('Connected!');
});

app.post('/insert', (req, res) => {
    const username = req.body.username
    const wpm = req.body.wpm
    const accuracy = req.body.accuracy

    db.query('INSERT INTO users (username, WordsPerMin, Accuracy) VALUES(?,?,?)', [username, wpm, accuracy], 
        (err, result) => {
            if(err) {
                console.log(err);
            } else {
                res.send("Values inserted!")
            }
        }
    );
});

app.get('/get', (req, res) => {
    db.query('SELECT * FROM users ORDER BY WordsPerMin DESC LIMIT 10', (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


app.listen(3001, () => {
    console.log('Server is running');
});



