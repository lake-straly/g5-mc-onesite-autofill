javascript:(function() {
    var rawFileUrl = 'https://raw.githubusercontent.com/lake-straly/g5-mc-onesite-autofill/suggestions/bookmarklet.js';
    fetch(rawFileUrl)
        .then(response => response.text())
        .then(code => {
            eval(code);
        })
        .catch(error => console.error('Error fetching code:', error));
})();
