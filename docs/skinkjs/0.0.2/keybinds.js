
// Delegated event listener
function doKeys(e) {
    console.log("in doKeys", e);
    const { ctrlKey, key, target } = e;
    if(Object.is(target, document.body) && ctrlKey) {
        // ctrl-k -> search
        if((key == '/') || key == '?') {
            e.preventDefault();
            e.stopImmediatePropagation();
            showSearch();
        } else {
            console.log("Nope", key);
        }
    }
}

document.addEventListener("DOMContentLoaded", (e) => {
    document.addEventListener("keydown", doKeys);
});
