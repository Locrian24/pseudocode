

window.onload = function() {
    document.getElementById('alg-input').focus();

}

window.addEventListener("keydown", (event) => {
    if (event.keyCode == 13) {
        let id = document.activeElement.id;
        let focussed = document.getElementById(id);

        try {
            focussed.contentEditable = false;
            focussed.classList.add('no-after');
         } catch (err) {
             console.log(err);
             return;
         }

       
        fetch(`http://localhost:8081/${focussed.textContent}`)
            .then(res => {
                var reader = res.body.getReader();
                function read() {
                    return reader.read().then(({value, done}) => {
                        if (done) {
                            console.log('done');
                            return;
                        }

                        let string = new TextDecoder("utf-8").decode(value);
                        let elements = htmlToElements(string);

                        let root = document.getElementById("root");

                        elements.forEach(child => {
                            root.appendChild(child);
                        })


                        read();
                    });
                };
                read();
            })
            .catch((err) => {
                console.log(err);
            });
    }
}, false);

function htmlToElements(html) {
    let template = document.createElement('template');
    template.innerHTML = html;
    return Array.from(template.content.childNodes);
}
