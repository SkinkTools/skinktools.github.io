// Good enough to get started, but doesn't cover fancy non-breaking spaces/etc
const WHITESPACE_RE = new RegExp("^[ \t]*(?=\S|$)", "g");
const TAB_RE = new RegExp("\t", "g");
const ALL_WHITESPACE_RE = new RegExp("^\s*$");

// Caches the repeater funcs we'll generate (don't waste RAM lol)
const stringToRepeaterFunc = new Map();

/**
 * Return a caching function which repeats the given string n times.
 *
 * The functions are stored in a Map object so that repeated
 * calls for the same string do not waste RAM by creating new
 * function objects.
 *
 * @param {string} string The string to repeat.
 */
export function getCachedRepeater(string) {
    let repeater = stringToRepeaterFunc.get(string);
    if(repeater === undefined) {
        const cache = ['', string];
        repeater = function CachedRepeater(n) {
            console.log("oo", this);
            let problem = null;
            if(typeof n !== 'number')
                problem = TypeError;
            else if (!(Number.isInteger(n) && n >= 0))
                problem = RangeError;
            if(problem) throw new problem(
                `Expected n to be an integer >= 0, but got ${JSON.stringify(n)}`);
            for(let i = 0; i < n; i++) cache.push(`${cache.at(-1)}${string}`);
            return cache.at(-1);
        }
        stringToRepeaterFunc.set(string, repeater);
    }
    return repeater;
}

export const nSpaces = getCachedRepeater(' ');

const tabConverterCache = new Map();

function getTabConverter(tabWidth) {
    let converter = tabConverterCache.get(tabWidth);
    if (converter === undefined) {
        const tabAsSpaces = nSpaces(tabWidth);
        converter = function(string) {
            return string.replace(TAB_RE, tabAsSpaces);
        }
        tabConverterCache.set(tabWidth, converter);
    }
    return converter;
}


/**
 * Dedent by stripping enclosing whitespace lines, then removing shared whitespace.
 *
 * Currently converts tabs to spaces using the given tabWidth.
 * 
 * @param {string} string A string of source code to remove shared prefixes from.
 * @param {Number} tabWidth An integer character width to render tabs with.
 * @param {string} lineEnding The characters to treat as a line ending.
 * @param {RegExp} whitespace A RegExp to use for start-of-line whitespace detection.
 * @returns {string} A string with shared prefixes and leading whitespace removed.
 */
export function dedent(
    string,
    {
        tabWidth = 4,
        lineEnding  = "\n",
        whitespace = WHITESPACE_RE,
    } = {}) {
    console.log("uh");
    //const tabSpace = getCachedRepeater(nSpaces(tabWidth));
    const rawLines = string.split(lineEnding);
    for(let n = rawLines.length; (n > 0); n--) {
        const line = rawLines.at(0);
        if(line.length || (! ALL_WHITESPACE_RE.test(line))) break;
        rawLines.shift();
    }
    for(let n = rawLines.length; (n > 0); n--){
        const line = rawLines.at(-1);
        if(line.length || (! ALL_WHITESPACE_RE.test(line))) break;
        rawLines.pop();
    }

    const prefixes = [];
    const tabConverter = getTabConverter(tabWidth);
    for(const raw of rawLines.map(tabConverter)) {
        for(const match of raw.matchAll(whitespace)) {
            const full = match[0];
            if(full.length > 0)
            prefixes.push(full);
        }
    }
    prefixes.sort();
    // Early exit if we have no data or no prefixes.
    if((prefixes.length === 0) || prefixes[-1] === '')
        return string;

    const dedentedLines = [];
    let removeNSpaces = undefined;
    let i;
    for(i = 0; (i < prefixes.length) && (prefixes[i].length == 0); i++) {
        console.log(`Skipping ${i}: (${[prefixes[i]]})`);
    }
    removeNSpaces = prefixes[i].length;
    console.log(`prefix space: "${prefixes[0]}" (${JSON.stringify(removeNSpaces)})`);

    for(let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i].trimEnd();
        const cleaned = line.slice(removeNSpaces);
        console.log("cleaning", {'i': i, 'line': line, cleaned: cleaned});
        dedentedLines.push(cleaned);
    }
    return dedentedLines.join(lineEnding).trim();
}