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
            fetch(`http://localhost:8081/${focussed.textContent}`)
            .then(res => {

                //handle streamed responses, appending to root element
                handleStream(res, root);
                
            })
            .catch((err) => {
                console.log(`Cannot access server: ${err}`);
            });
        } else if (focussed.id === "key-input") {
            //TODO Manage key options here
        }
    }
}, false);

/**
 * Fetches code fragments from chosen Wiki page
 * Must only be called from page link
 */
document.addEventListener('click', function handler(ele) {
    if (ele.target.className === "result-link") {
        document.removeEventListener('click', handler);
        
        fetch(`http://localhost:8081/pageid/${ele.target.id}`)
            .then(res => {
                handleStream(res, root);
            })
            .catch(err => {
                console.log(`Cannot access server: ${err}`);
            })
    }
});

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
                child.focus();
            })

            read();
        });
    };
    read();
}
