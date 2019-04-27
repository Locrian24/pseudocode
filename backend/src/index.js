const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const axios = require('axios');

const app = express();
const PORT = 8081;

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

//Initial search for pages
app.get('/:initialsearch', (req, res) => {
    let search = req.params.initialsearch;
    var wiki_pages;

    axios
        .get(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=&list=search&srsearch=${search}&srinfo=totalhits&srprop=snippet`)
        .then((response) => {
            wiki_pages = [response.data.query.searchinfo.totalhits, response.data.query.search];
            res.send(wiki_pages);
        })
        .catch((error) => {
            res.send(error);
        });
});

//Pulls all code frags from specific page
app.get('/pageid/:id', (req, res) => {
    let id = req.params.id;

    axios
        .get(`https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&pageid=${id}&prop=displaytitle%7Ctext`)
        .then((response) => {
            let html = response.data.parse.text;
            let stringify = JSON.stringify(html);
            
            let code_frags = stringify.match(/<pre>(.*?)<\/pre>/gm);
            let page = [response.data.parse.displaytitle, code_frags];

            res.send(page);
        })
        .catch((error) => {
            res.send(error);
        });
})



app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
});