const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'snippets.json');

app.use(bodyParser.json());
app.use(cors());

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, '[]');
}

app.use(express.static(__dirname));

app.get('/snippets', (req, res, next) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) {
      return next(err);
    }

    try {
      const snippets = JSON.parse(data);
      res.json(snippets);
    } catch (error) {
      next(error);
    }
  });
});

app.get('/snippets/:id', (req, res, next) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) {
      return next(err);
    }

    try {
      const snippets = JSON.parse(data);
      const snippet = snippets.find((s) => s.id === req.params.id);

      if (!snippet) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      res.json(snippet);
    } catch (error) {
      next(error);
    }
  });
});

app.post('/snippets', (req, res, next) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) {
      return next(err);
    }

    try {
      const snippets = JSON.parse(data);
      const newSnippet = { id: uuidv4(), ...req.body };

      snippets.push(newSnippet);

      fs.writeFile(DB_FILE, JSON.stringify(snippets, null, 2), (err) => {
        if (err) {
          return next(err);
        }

        res.json(newSnippet);
      });
    } catch (error) {
      next(error);
    }
  });
});

app.put('/snippets/:id', (req, res, next) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) {
      return next(err);
    }

    try {
      const snippets = JSON.parse(data);
      const snippetIndex = snippets.findIndex((s) => s.id === req.params.id);

      if (snippetIndex === -1) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      const updatedSnippet = { id: req.params.id, ...req.body };
      snippets[snippetIndex] = updatedSnippet;

      fs.writeFile(DB_FILE, JSON.stringify(snippets, null, 2), (err) => {
        if (err) {
          return next(err);
        }

        res.json(updatedSnippet);
      });
    } catch (error) {
      next(error);
    }
  });
});

app.delete('/snippets/:id', (req, res, next) => {
  fs.readFile(DB_FILE, 'utf8', (err, data) => {
    if (err) {
      return next(err);
    }

    try {
      const snippets = JSON.parse(data);
      const snippetIndex = snippets.findIndex((s) => s.id === req.params.id);

      if (snippetIndex === -1) {
        return res.status(404).json({ error: 'Snippet not found' });
      }

      const deletedSnippet = snippets.splice(snippetIndex, 1)[0];

      fs.writeFile(DB_FILE, JSON.stringify(snippets, null, 2), (err) => {
        if (err) {
          return next(err);
        }

        res.json(deletedSnippet);
      });
    } catch (error) {
      next(error);
    }
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to download the JSON storage file
app.get('/download', (req, res) => {
  res.download(DB_FILE);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
