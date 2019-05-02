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

    res.write(`<p class="update">Querying Wiki's API...</p>`);

    axios
        .get(`https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&list=search&srprop&srsearch=${search}&srinfo=totalhits`)
        .then((response) => {
            res.write(`<p class="program">Showing top 6 of ${response.data.query.searchinfo.totalhits} results:</p>`);

            let search_results = response.data.query.search;
            res.write(`<div class="result-grid">`);
            for (let i = 0; i < 6; i++) {
                let pageid = search_results[i]["pageid"];
                let page_title = search_results[i]["title"];
                res.write(`<p id="${pageid}">${page_title}</p>`);
            }
            res.write(`</div>`);
            res.end();
        })
        .catch((error) => {
            res.write(error);
            res.end();
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