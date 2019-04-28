

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

        fetch('https://api.github.com/users/Locrian24')
            .then((res) => {
                console.log(res);
            })
            .catch((err) => {
                console.log(err);
            });
    }
}, false);

