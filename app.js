const express = require('express');
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
// mongoose
//   .connect(
//     'mongodb+srv://tamim:tamim@notereg-6dkt1.mongodb.net/test?retryWrites=true&w=majority',
//     { useNewUrlParser: true, useUnifiedTopology: true }
//   )
//   .then(() => console.log('Databse Conntected'))
//   .catch(err => console.log(err));

// Load Note Model
require('./models/Note');
const Note = mongoose.model('notes');

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

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
      res.redirect('/notes');
    });
  }
});

app.put('/notes/:id', (req, res) => {
  Note.findById(req.params.id).then(note => {
    note.title = req.body.title;
    note.content = req.body.content;
    note.save().then(note => {
      res.redirect('/notes');
    });
  });
});

app.delete('/notes/:id', (req, res) => {
  Note.findById(req.params.id).then(note => {
    note.remove().then(() => {
      res.redirect('/notes');
    });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
