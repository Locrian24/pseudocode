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
        var root = document.getElementById("root");

        try {
            focussed.contentEditable = false;
            focussed.classList.add('no-after');
         } catch (err) {
             console.log(err);
             return;
         }

        if (focussed.id === "alg-input") {
            //remove identifier so that we don't refocus the wrong element
            focussed.removeAttribute("id");

            fetch(`http://localhost:8081/${focussed.textContent}`)
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
            //TODO Manage key options here
            let option = focussed.textContent;
            switch(option.toUpperCase()) {
                case "R":
                    while(root.firstChild) {
                        root.removeChild(root.firstChild);
                    }

                    root.insertAdjacentHTML('beforeend', '<div class="program">./pseudocode_fetcher ><div id="alg-input" class="input alg-input" contenteditable="true"></div></div>');
                    document.getElementById('alg-input').focus();
                    document.addEventListener('click', clickEventHandler);
                    
                    break;
                case "C": //copy to clipboard

                    break;
                case "N": //next code fragment

                    break;
                default: //not a valid input error
                    break;
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
        
        fetch(`http://localhost:8081/parse/${ele.target.id}/0`)
            .then(res => {
                handleStream(res, root);
            })
            .catch(err => {
                console.log(`Cannot access server: ${err}`);
            })
    }
}

/**
 * Converts string into DOM Elements using the template tag (HTML5)
 * @param {String} html String representation of DOM elements
 */
function htmlToElements(html) {
    let template = document.createElement('template');
    template.innerHTML = html;
    return Array.from(template.content.childNodes);
}

/**
 * 
 * @param {Response} response Response of fetch query
 * @param {HTMLElement} root Element to append all returned DOM Elements
 */
function handleStream(response, root) {
    var reader = response.body.getReader();
    function read() {
        return reader.read().then(({value, done}) => {
            if (done) {
                return;
            }

            let string = new TextDecoder("utf-8").decode(value);
            let elements = htmlToElements(string);

            elements.forEach(child => {
                root.appendChild(child);
                child.scrollIntoView();
                if (document.querySelector("#key-input")) {
                    document.getElementById("key-input").focus();
                }
            })

            read();
        });
    };
    read();
}
