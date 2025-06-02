import { dedent } from "./dedent.js";

class CodeBlock extends HTMLElement {
    constructor() {
        super()
        this.internals_ = this.attachInternals();
        const dedented = dedent(this.innerHTML);
        this.innerHTML = `<pre><code>${dedented}</code></pre>`;
    }
}

customElements.define("code-block", CodeBlock);
