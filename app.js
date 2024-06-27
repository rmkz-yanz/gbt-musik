const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Menambahkan ini untuk melayani file statis dari 'uploads'

// Konfigurasi penyimpanan untuk multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const newFileName = req.body.newFileName + path.extname(file.originalname);
        cb(null, newFileName);
    }
});

const upload = multer({ storage: storage });

// Baca data dari data.json
const getData = () => {
    const jsonData = fs.readFileSync('data.json');
    return JSON.parse(jsonData);
};

const saveData = (data) => {
    const stringifyData = JSON.stringify(data, null, 2);
    fs.writeFileSync('data.json', stringifyData);
};

// Routes
app.get('/', (req, res) => {
    const searchQuery = req.query.search || '';
    let musicData = getData();

    // Filter musicData berdasarkan searchQuery
    if (searchQuery) {
        musicData = musicData.filter(music => 
            music.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            music.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    res.render('index', { musicData });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', upload.single('file'), (req, res) => {
    const musicData = getData();
    const newMusic = {
        id: Date.now(),
        title: req.body.title,
        filename: req.file.filename,
        description: req.body.description
    };
    musicData.push(newMusic);
    saveData(musicData);
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
