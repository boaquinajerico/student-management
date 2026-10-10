const express = require('express');
const mysql = require('mysql2');

const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'student_management',
    port: 8889
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function renderStudentList(res, keyword = '') {
    const searchValue = `%${keyword}%`;
    const sql = `
        SELECT * FROM students
        WHERE student_id LIKE ?
        OR first_name LIKE ?
        OR last_name LIKE ?
        OR course LIKE ?
        ORDER BY id DESC
    `;

    db.query(sql, [searchValue, searchValue, searchValue, searchValue], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        res.render('index', {
            students: results,
            keyword
        });
    });
}

app.get('/', (req, res) => {
    res.redirect('/students');
});

app.get('/students', (req, res) => {
    renderStudentList(res, req.query.keyword || '');
});

app.get('/students/add', (req, res) => {
    res.render('add');
});

app.post('/students/add', (req, res) => {
    const { student_id, first_name, last_name, course, year_level, email } = req.body;

    const sql = `
        INSERT INTO students
        (student_id, first_name, last_name, course, year_level, email)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [student_id, first_name, last_name, course, year_level, email];

    db.query(sql, values, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Unable to save student');
        }

        res.redirect('/students');
    });
});

app.get('/students/search', (req, res) => {
    const keyword = req.query.keyword || '';
    renderStudentList(res, keyword);
});

app.get('/students/:id/edit', (req, res) => {
    const sql = 'SELECT * FROM students WHERE id = ?';

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            return res.status(404).send('Student not found');
        }

        res.render('edit', { student: results[0] });
    });
});

app.post('/students/:id/edit', (req, res) => {
    const { student_id, first_name, last_name, course, year_level, email } = req.body;
    const sql = `
        UPDATE students
        SET student_id = ?, first_name = ?, last_name = ?, course = ?, year_level = ?, email = ?
        WHERE id = ?
    `;

    db.query(sql, [student_id, first_name, last_name, course, year_level, email, req.params.id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Unable to update student');
        }

        res.redirect('/students');
    });
});

app.post('/students/:id/delete', (req, res) => {
    const sql = 'DELETE FROM students WHERE id = ?';

    db.query(sql, [req.params.id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Unable to delete student');
        }

        res.redirect('/students');
    });
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});