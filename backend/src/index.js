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
                res.write(`<p class="result-link" id="${pageid}">${page_title}</p>`);
            }
            res.write(`</div>`);
            res.write(`<p class="program">Click on the desired page to be parsed...</p>`);
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

    res.write(`<p class="update">Fetching page content...</p>`);

    axios
        .get(`https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&pageid=${id}&prop=displaytitle%7Ctext`)
        .then((response) => {

            res.write(`<p class="update">Extracting pseudocode fragments...</p>`);

            let html = response.data.parse.text;
            let code_frags = extractPre(html);
            if (code_frags.length == 0) {
                res.write(`<p class="program">No pseudocode found for ${response.data.parse.displaytitle}! Press R to restart</p>`);
                res.write(`<div class="program">./pseudocode_fetcher ><div id="key-input" class="input key-input" contenteditable="true"></div></div>`);
                res.end();
            }

            res.write(`<p class="program">First pseudocode fragment for ${response.data.parse.displaytitle}:</p>`);

            let parsed_frag = code_frags[0].replace(/\\n/g, '\<br \/\>');
            res.write(`<div id="0" class="result">`);
            res.write(parsed_frag);
            res.write(`</div>`);

            res.write(`<p class="program">(C = copy to clipboard, N = next fragment, R = restart)</p>`);
            res.write(`<div class="program">./pseudocode_fetcher ><div id="key-input" class="input key-input" contenteditable="true"></div></div>`);

            res.end();
        })
        .catch((error) => {
            res.write(error);
            res.end();
        });
})

//Local server start
app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
});

/**
 * Extracts all <pre> sections from a page's html
 * @param {String} page_html 
 */
function extractPre(page_html) {
    let stringify = JSON.stringify(page_html);
    return stringify.match(/<pre>(.*?)<\/pre>/gm);
}