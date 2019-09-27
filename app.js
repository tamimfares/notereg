const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
var methodOverride = require('method-override');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const moment = require('moment');

const app = express();

// Conntect to DB
mongoose
  .connect('mongodb://localhost/notereg', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('Databse Conntected'))
  .catch(err => console.log(err));

// Load Note Model
require('./models/Note');
const Note = mongoose.model('notes');

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
app.use(flash());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Global Variables for Flash Mesgs
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Index Route
app.get('/', (req, res) => {
  res.render('index');
});

// About Route
app.get('/about', (req, res) => {
  res.render('about');
});

// Notes Routes
app.get('/notes', (req, res) => {
  Note.find({})
    .sort({ date: 'desc' })
    .then(notes => {
      res.render('notes/index', {
        notes: notes
      });
    });
});

app.get('/notes/add', (req, res) => {
  res.render('notes/add');
});

app.get('/notes/:id', (req, res) => {
  Note.findById(req.params.id).then(note => {
    res.render('notes/edit', {
      note: note
    });
  });
});

app.post('/notes', (req, res) => {
  let errors = [];
  if (!req.body.title) {
    errors.push({ text: 'Please add a Note Title.' });
  }

  if (req.body.title.length < 5) {
    errors.push({ text: 'Note Title must be 5 Characters at least.' });
  }

  if (errors.length > 0) {
    res.render('notes/add', {
      errors: errors,
      title: req.body.title,
      content: req.body.content
    });
  } else {
    const newUser = {
      title: req.body.title,
      content: req.body.content
    };
    new Note(newUser).save().then(note => {
      req.flash('success_msg', 'Note has been added.')
      res.redirect('/notes');
    });
  }
});

app.put('/notes/:id', (req, res) => {
  Note.findById(req.params.id).then(note => {
    note.title = req.body.title;
    note.content = req.body.content;
    note.save().then(note => {
      req.flash('success_msg', 'Note has been updated.')
      res.redirect('/notes');
    });
  });
});

app.delete('/notes/:id', (req, res) => {
  Note.findById(req.params.id).then(note => {
    note.remove().then(() => {
      req.flash('success_msg', 'Note has been removed.')
      res.redirect('/notes');
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
