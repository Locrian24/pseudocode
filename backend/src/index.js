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


/**
 * Initial search for pages
 */
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
            res.write(`<p class="program">Click on the desired page...</p>`);
            res.status(404).end();
        })
        .catch((error) => {
            res.write(`<p class="error">${error}</p>`);
            res.status(500).end();
        });
});

/**
 * Pulls all code frags from specific page
 */
app.get('/parse/:id/:fragnum', (req, res, next) => {
    let id = req.params.id;
    let frag_num = parseInt(req.params.fragnum);

    res.write(`<p class="update">Fetching page content...</p>`);

    axios
        .get(`https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&pageid=${id}&prop=displaytitle%7Ctext`)
        .then((response) => {

            res.write(`<p class="update">Extracting pseudocode fragments...</p>`);

            //Extracting all <pre> groups from page html
            let html = response.data.parse.text;
            let code_frags = extractPre(html);

            if (!code_frags) {
                //No <pre> tags found
                res.write(`<p class="error">No pseudocode found for ${response.data.parse.displaytitle}! Press R to restart</p>`);
                res.write(`<div class="program">./pseudocode_fetcher ><div id="key-input" class="input key-input" contenteditable="true"></div></div>`);
                res.status(404).end();
                return next();
            }

            //Specific <pre> group wanted
            let parsed_frag = code_frags[frag_num];

            if (!parsed_frag) {
                //No more <pre> tags
                //TODO Add better functionality than having to restart (go back to previous?)
                res.write('<p class="error">Cannot find another fragment in the document. Please restart to try again (R)</p>');
                res.write(`<div class="program">./pseudocode_fetcher ><div id="key-input" class="input key-input" contenteditable="true"></div></div>`);
                res.status(404).end();
                return next();
            }

            //<pre> section found and can now be returned through stream
            parsed_frag = parsed_frag.replace(/\\n/g, '<br />');

            res.write(`<p class="program">Fragment ${frag_num + 1} for ${response.data.parse.displaytitle}:</p>`);
            res.write(`<div id="0" class="result">`);
            res.write(parsed_frag);
            res.write(`</div>`);

            res.write(`<p class="program">(C = copy to clipboard, N = next fragment, R = restart)</p>`);
            res.write(`<div class="program">./pseudocode_fetcher ><div id="key-input" class="input key-input" contenteditable="true"></div></div>`);

            res.status(200).end();
        })
        .catch((error) => {
            res.write(`<p class="error">${error}</p>`);
            res.status(500).end();
        });
});

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