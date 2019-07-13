window.onload = function() {
    document.getElementById('alg-input').focus();
}

/**
 * Detects and handles user text input when they are prompted
 */
window.addEventListener("keydown", (event) => {
    if (event.keyCode == 13) {
        let id = document.activeElement.id;
        let focussed = document.getElementById(id);
        const root = document.getElementById("root");

        try {
            focussed.contentEditable = false;
            focussed.classList.add('no-after');
        } catch (err) {
            console.log(err);
            return;
        }

        var input = focussed.textContent;

        if (focussed.id === "alg-input") {
            //remove identifier so that we don't refocus the wrong element
            focussed.removeAttribute("id");

            if (input === "clear") {
                resetElement(root);
                return;
            } else if (input === "") {
                appendToDom('<p class="error">Can\'t do anything with an empty query. Please try again...</p><p class="program">&#8594; Please enter an algorithm:</p><div class="tilde">~<div id="alg-input" class="input alg-input" contenteditable="true"><wbr></div></div>');
                

                document.getElementById('alg-input').focus();
                document.addEventListener('click', clickEventHandler);
                return;
            }

            appendToDom(`<p class="update">&#8594; Querying Wiki's API...</p>`);

            fetch(`https://backend.locrian24.now.sh/${input}`)
            .then(res => {
                //handle streamed responses, appending to root element
                handleStream(res, root);
                
            })
            .catch((err) => {
                console.log(`Cannot access server: ${err}`);
            });

        } else if (focussed.id === "key-input") {
            //remove identifier so that we don't refocus the wrong element
            focussed.removeAttribute("id");

            if (input === "") {
                appendToDom('<p class="error">Can\'t do anything with an empty query. Please try again...</p><p class="program">&#8594; Please enter an algorithm:</p><div class="tilde">~<div id="key-input" class="input key-input" contenteditable="true"><wbr></div></div>');
                
                document.getElementById('key-input').focus();
                return;
            }

            input = input.toLowerCase();
            
            if (input === "clear")  {
                resetElement(root);
            } 
            else if (input === "copy") {
                let pseudo = document.querySelector('.result-id').innerHTML;
                copyToClipboard(pseudo);
            }
            else if (input === "next") { //next code fragment
                let current_frag = document.querySelector('.result-id');
                let current_frag_num = parseInt(current_frag.id);
                current_frag.className = "result";

                let current_pageid = document.querySelector('.current_id').id;
                appendToDom(`<p class="update">&#8594; Scraping page content...</p>`);
                fetch(`https://backend.locrian24.now.sh/parse/${current_pageid}/${current_frag_num+1}`)
                    .then(res => {
                        handleStream(res, root);
                    })
                    .catch(err => {
                        console.log(`Cannot access server: ${err}`);
                    })
            }
            else if (input === "new") {
                appendToDom('<p class="program">Please enter an algorithm:</p><div class="tilde">~<div id="alg-input" class="input alg-input" contenteditable="true"><wbr></div></div>');
                
            
                document.getElementById('alg-input').focus();
                document.addEventListener('click', clickEventHandler);
            } 
            else {
                appendToDom('<p class="error">Not a valid command. Please try again...</p><p class="comment">&#8594; Commands: <i>copy</i> = copy to clipboard, <i>next</i> = next fragment, <i>clear</i> = clear screen, <i>new</i> = new algorithm</p><div class="tilde">~/pseudo-scraper<div id="key-input" class="input key-input" contenteditable="true"><wbr></div></div>');
            
                document.getElementById('key-input').focus();
                return;
            }
            
        }
    }
}, false);

/**
 * Fetches code fragments from chosen Wiki page
 * Must only be called from page link
 */
document.addEventListener('click', clickEventHandler);

function clickEventHandler(ele) {
    if (ele.target.className === "result-link") {
        document.removeEventListener('click', clickEventHandler);
        
        document.querySelector('.current_id').setAttribute('id', ele.target.id);

        let streamed_res = '';

        appendToDom(`<p class="update">&#8594; Scraping page content...</p>`);

        fetch(`https://backend.locrian24.now.sh/parse/${ele.target.id}/0`)
            .then(res => {
                handleStream(res, root, streamed_res);
            })
            .catch(err => {
                console.log(`Cannot access server: ${err}`);
            })
    }
}

/**
 * Uses regex to make the copy readable then uses execCommand to copy to clipboard
 * @param {String} html_string String containing html tags
 */
function copyToClipboard(html_string) {
    html_string = html_string.replace(/<br>/gm, '\n');
    html_string = html_string.replace(/<(?:.|\n)*?>/gm, '');

    const tmp = document.createElement('textarea');
    tmp.value = html_string;
    tmp.setAttribute('readonly', '');
    tmp.style.position = 'absolute';
    tmp.style.left = '-9999px';
    document.body.appendChild(tmp);
    tmp.select();
    try {
        let success = document.execCommand('copy');
        if (success) {
            appendToDom('<p class="program">Succesfully copied!</p>');
        } else {
            throw('oof');
        }
    } catch (err) {
        appendToDom('<p class="error">Unable to copy the fragment!</p>');
    }
    document.body.removeChild(tmp);

    appendToDom('<p class="comment">&#8594; Commands: <i>copy</i> = copy to clipboard, <i>next</i> = next fragment, <i>clear</i> = clear screen, <i>new</i> = new algorithm</p><div class="tilde">~/pseudo-scraper<div id="key-input" class="input key-input" contenteditable="true"><wbr></div></div>');

    document.getElementById('key-input').focus();
}

/**
 * Clears all elements and resets to first input field
 * @param {Node} element_root Node which will be the root for the reset (all it's children)
 */
function resetElement(element_root) {
    while(element_root.firstChild) {
        root.removeChild(element_root.firstChild);
    }

    appendToDom('<p class="program">Please enter an algorithm:</p><div class="tilde">~<div id="alg-input" class="input alg-input" contenteditable="true"><wbr></div></div>');

    document.getElementById('alg-input').focus();
    document.addEventListener('click', clickEventHandler);
}

/**
 * Creates Nodes to add to DOM 
 * @param {String} html_string String containing html tags
 */
function appendToDom(html_string) {
    let elements = htmlToElements(html_string);
    elements.forEach(element => {
        root.appendChild(element);
        element.scrollIntoView();
    })
}

/**
 * Converts string into DOM Elements using the template tag (HTML5)
 * @param {String} html_string String representation of DOM elements
 */
function htmlToElements(html_string) {
    let template = document.createElement('template');
    template.innerHTML = html_string;
    
    return Array.from(template.content.childNodes);
}

/**
 * Handles the response stream of the backend, concatenating until a deliminator and then appends to #root div
 * @param {Response} response Response of fetch query
 * @param {HTMLElement} root Element to append all returned DOM Elements
 * @param {String} stream Total non-deliminated response so far (cannot assume chunk size)
 */
function handleStream(response, root, stream) {
    var reader = response.body.getReader();
    async function read() {
        return reader.read().then(({value, done}) => {
            if (done) { //stream has ended
                return;
            }

            let string = new TextDecoder("utf-8").decode(value);

            if (!stream) stream = string;
            else stream += string;

            if (stream.match(/.+DEL$/gm)) {

                let groups = stream.split("DEL");
                groups.pop(); //delim on end gives empty array element'

                stream = '';
    
                groups.forEach(group => {
                    let elements = htmlToElements(group);

                    elements.forEach(child => {
                        root.appendChild(child);
                        child.scrollIntoView();
                        if (document.querySelector("#key-input")) {
                            document.getElementById("key-input").focus();
                        } 
                        else if (document.querySelector("#err-input")) {
                            document.getElementById("err-input").focus();
                        }
                        else if (document.querySelector("#alg-input")) {
                            document.getElementById("alg-input").focus();
                            document.addEventListener('click', clickEventHandler);
                        }
                    })
                })
                
            }
            read();
        });
    };
    read();
}
