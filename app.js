const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const salt = bcrypt.genSaltSync(10)
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const app = express()
const router = express.Router()
const moment = require('moment')
const { now } = require('moment')

app.set('view engine', 'ejs')
app.use(express.static('./public'))
app.use(bodyParser.json())
app.use(cors())

// route guards
// app.use( (req, res, next) => {
//     if(req.session.isLoggedIn === true) {
//         next()
//     }else {
//         res.render('login')
//     }
// })

const connection = mysql.createConnection({
	// multipleStatements: true,
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'pastebin',
})

connection.connect((err) => {
	if (err) throw err
	console.log('Database connected')
})

//P.S. You may use and edit these functions. They are here for a reason :)
function generateUUID() {
	let generate = ''
	const char =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	const length = 32
	for (var i = 0; i < length; i++) {
		generate += char.charAt(Math.floor(Math.random() * char.length))
	}
	checkExists(generate)
	return generate
}

function checkExists(code) {
	connection.query(
		"SELECT * FROM accounts WHERE uuid = '" + code + "'",
		(err, response) => {
			if (err) throw err
			if (response.length > 0) {
				return code
			} else {
				generateUUID()
			}
		}
	)
}

app.use(
	session({
		secret: 'Ch43y0Vn6Num84W4N',
		saveUninitialized: true,
		resave: true,
	})
)
//write you code here
//Good luck!

// landing page
app.get('/', (req, res) => {
	if(req.session.isLoggedIn) {
        res.redirect('/notes')
    }else {
        res.render('login')
    }
})

// login
app.post('/login', urlencodedParser, (req, res) => {
	let sql = `SELECT * FROM accounts WHERE username = '${req.body.username}'`
	connection.query(sql, (err, data) => {
		if (err) throw err
		if (data.length > 0) {
			bcrypt.compare(
				req.body.password,
				data[0].password,
				(err, response) => {
					if (response) {
						req.session.uuid = data[0].uuid
						req.session.isLoggedIn = true
						res.redirect('/notes')
					} else {
						res.render('login', { password: 'Incorrect password' })
					}
				}
			)
		} else {
			// user does not exist
			res.render('login', { username: 'User does not exist' })
		}
	})
})

app.get('/register', (req, res) => {
	res.render('register')
})

app.post('/register', urlencodedParser, (req, res) => {
	let code = generateUUID()

	// hash the password
	let password = bcrypt.hashSync(req.body.password, salt)
	let sql = `INSERT INTO accounts(uuid, username, password) VALUES('${code}', '${req.body.username}', '${password}')`
	connection.query(sql, (err, data) => {
		if (err) throw err
		req.session.uuid = code
		res.redirect('/notes')
	})
})

// notes
app.get('/notes', (req, res) => {
	if (req.session.isLoggedIn) {
		let sql = `SELECT * FROM text WHERE account_uuid = '${req.session.uuid}' AND status = 'Active'`
		connection.query(sql, (err, data) => {
			if (err) throw err
			res.render('notes', { data, moment })
		})
	} else {
		res.redirect('/')
	}
})

app.get('/noteslist', (req, res) => {
	if (req.session.isLoggedIn) {
		let sql = `SELECT * FROM text WHERE account_uuid = '${req.session.uuid}' AND status = 'Active'`
		connection.query(sql, (err, data) => {
			if (err) throw err
			res.render('notescontent', { data })
			console.log(data)
		})
	} else {
		res.redirect('/')
	}
})

app.get('/notes/create', (req, res) => {
	if (req.session.isLoggedIn) {
		res.render('createnote')
	} else {
		res.redirect('/')
	}
})

app.post('/notes/create', urlencodedParser, (req, res) => {
	if (req.session.isLoggedIn) {
		let text_uuid = generateUUID()
		let sql = `INSERT INTO text(account_uuid, text_uuid, title, content) VALUES('${req.session.uuid}', '${text_uuid}', '${req.body.title}', '${req.body.content}')`
		connection.query(sql, (err, data) => {
			if (err) throw err
			res.render('createnote')
		})
	} else {
		res.redirect('/')
	}
})

app.get('/note/:uuid', (req, res) => {
	let sql = `SELECT * FROM text WHERE text_uuid = '${req.params.uuid}'`
	connection.query(sql, (err, data) => {
		if (err) throw err
		if (data.length > 0) {
			res.render('shownote', { data })
		}
	})
})

app.get('/notes/:uuid/edit', (req, res) => {
	if (req.session.isLoggedIn) {
		let sql = `SELECT * FROM text WHERE account_uuid = '${req.session.uuid}' AND text_uuid = '${req.params.uuid}'`
		connection.query(sql, (err, data) => {
			if (err) throw err
			res.render('editnote', { data })
		})
	} else {
		res.redirect('/')
	}
})

app.post('/notes/:uuid', urlencodedParser, (req, res) => {
	let sql = `UPDATE text SET title = '${req.body.title}', content = '${req.body.content}', updated_at = now() WHERE text_uuid = '${req.params.uuid}'`
	connection.query(sql, (err, data) => {
		if (err) throw err
		res.redirect('/notes')
	})
})

app.post('/notes/delete/:uuid', urlencodedParser, (req, res) => {
	let sql = `UPDATE text SET title = '${req.body.title}', content = '${req.body.content}', status = 'Inactive', deleted_at = now() WHERE account_uuid = '${req.session.uuid}' AND text_uuid = '${req.params.uuid}'`
	connection.query(sql, (err, data) => {
		if (err) throw err
		res.redirect('/notes')
	})
})

app.get('/notes/archived', (req, res) => {
    if(req.session.isLoggedIn) {
        let sql = `SELECT * FROM text WHERE account_uuid = '${req.session.uuid}' AND status = 'Inactive'`
        connection.query(sql, (err, data) => {
            if(err) throw err
            res.render('archivednotes', { data })
        })
    }else {
        res.redirect('/')
    }
})

app.get('/logout', (req, res) => {
    req.session.uuid = ''
    req.session.isLoggedIn = false
    res.redirect('/')
})

app.listen(3000, () => console.log('Server is running at port 3000'))
