let exportedFetch: any;
if (typeof module !== 'undefined' && module.exports) {
    // tslint:disable-next-line:no-var-requires
    exportedFetch = require('node-fetch');
} else {
    exportedFetch = fetch;
}

export default exportedFetch;
