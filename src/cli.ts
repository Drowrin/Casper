// commandline interface for casper, rather than running a server
// args are transformed into an id, and then the result of an id lookup is printed to the console.
// used for debugging data changes

import { Parser } from './parser';

// example: `npm run casper weapon longsword`
if (require.main === module) {
    var arg = process.argv.slice(2).join('.');

    let parser = new Parser();

    var casper = parser.makeCasper();

    console.log(JSON.stringify(casper.get(arg), null, 2));
}
