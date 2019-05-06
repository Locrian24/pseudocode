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
app.get('/:initialsearch', (req, res, next) => {
    let search = req.params.initialsearch;

    res.write(`<p class="update">&#8594; Querying Wiki's API...</p>`);
    res.write(`DEL`);

    axios
        .get(`https://en.wikipedia.org/w/api.php?action=query&origin=*&format=json&list=search&srprop&srsearch=${search}&srinfo=totalhits`)
        .then((response) => {

            let search_results = response.data.query.search;

            if (search_results.length == 0) {
                //No page of the name given exists
                res.write(`<p class="error">&#8594; No page named ${search} exists! Restarting...</p>`);
                res.write('<p class="program">&#8594; Please enter an algorithm:</p>');
                res.write(`<div class="tilde">~<div id="alg-input" class="input alg-input" contenteditable="true"><wbr></div></div>`);
                res.status(404).end(`DEL`);
                return next();
            }

            let bound = ((search_results.length < 6) ? search_results.length : 6 );

            res.write(`<p class="program">&#8594; Choose your Wiki page from the top ${bound} of ${response.data.query.searchinfo.totalhits} hits:</p>`);
            res.write(`<div class="result-grid">`);
            for (let i = 0; i < bound; i++) {
                let pageid = search_results[i]["pageid"];
                let page_title = search_results[i]["title"];
                res.write(`<p class="result-link" id="${pageid}">${page_title}</p>`);
            }
            res.write(`</div>`);
            res.status(200).end(`DEL`);
        })
        .catch((error) => {
            res.write(`<p class="error">&#8594; ${error}</p>`);
            res.status(500).end(`DEL`);
        });
});

/**
 * Pulls all code frags from specific page
 */
app.get('/parse/:id/:fragnum', (req, res, next) => {
    let id = req.params.id;
    let frag_num = parseInt(req.params.fragnum);

    res.write(`<p class="update">&#8594; Fetching page content...</p>`);
    res.write(`DEL`);

    axios
        .get(`https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&pageid=${id}&prop=displaytitle%7Ctext`)
        .then((response) => {

            //Extracting all <pre> groups from page html
            let html = response.data.parse.text;
            let code_frags = extractPre(html);

            if (!code_frags) {
                //No <pre> tags found
                res.write(`<p class="error">&#8594; No pseudocode found for ${response.data.parse.displaytitle}! Restarting...</p>`);
                res.write('<p class="program">&#8594; Please enter an algorithm:</p>');
                res.write(`<div class="tilde">~<div id="alg-input" class="input alg-input" contenteditable="true"><wbr></div></div>`);
                res.status(404).end(`DEL`);
                return next();
            }

            //Specific <pre> group wanted
            let parsed_frag = code_frags[frag_num];

            if (!parsed_frag) {
                //No more <pre> tags
                res.write('<p class="error">&#8594; Cannot find another fragment in the document. Restarting...</p>');
                res.write('<p class="program">&#8594; Please enter an algorithm:</p>');
                res.write(`<div class="tilde">~<div id="alg-input" class="input alg-input" contenteditable="true"><wbr></div></div>`);
                res.status(404).end(`DEL`);
                return next();
            }

            //<pre> section found and can now be returned through stream
            //parsed_frag is the extracted pseudocode from the Wiki page
            parsed_frag = parsed_frag.replace(/\\n/g, '<br />');

            res.write(`<p class="program">&#8594; Fragment ${frag_num + 1} of ${code_frags.length} for ${response.data.parse.displaytitle}:</p>`);
            res.write(`<div id="${frag_num}" class="result result-id">${parsed_frag}</div>`);

            res.write(`<p class="comment">&#8594; Commands: <i>copy</i> = copy to clipboard, <i>next</i> = next fragment, <i>clear</i> = clear screen, <i>new</i> = new algorithm</p>`);
            res.write(`<div class="tilde">~/pseudo-fetcher<div id="key-input" class="input key-input" contenteditable="true"><wbr></div></div>`);
            res.status(200).end(`DEL`);
        })
        .catch((error) => {
            res.write(`<p class="error">${error}</p>`);
            res.status(500).end(`DEL`);
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