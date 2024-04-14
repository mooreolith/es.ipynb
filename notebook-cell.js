import { marked } from './lib/marked.esm.js';

class NotebookCell extends HTMLElement {  
  #cell_type = 'code';
  #source = '';
  #output = '';
  #metadata = {};
  #execution_count = null;
  
  static #id = 0;
  static get #cellId(){
    return `cell-${NotebookCell.#id++}`;
  }

  constructor(){
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback(){
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 600px;
          margin-top: 10px;
          margin-bottom: 10px;
          border: 1px dashed gray;
        }

        table {
          border-collapse: collapse;
          margin: 25px;
          font-size: 0.9em;
          font-family: sans-serif;
          min-width: 400px;
          box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
        }

        table thead tr {
          background-color: #009879;
          color: #ffffff;
          text-align: left;
        }

        th, td {
          padding: 12px 15px;
        }

        table tbody tr {
          border-bottom: 1px solid #dddddd;
        }
        
        table tbody tr:nth-of-type(even) {
            background-color: #f3f3f3;
        }
        
        table tbody tr:last-of-type {
            border-bottom: 2px solid #009879;
        }

        .container {
          position: relative;
          width: 600px;
          top: 0;
          left: 0;
          overflow: hidden;
        }

        input, wc-codemirror, div.output {
          top: 0;
          left: 0;
          overflow: hidden;
        }

        wc-codemirror {
          width: 100vw;
          max-width: 100vw;
        }

        .CodeMirror-wrap pre {
          word-wrap: break-word;
        }

        p.error {
          color: orangered;
        }

        button {
          background: rgb(206, 215, 235);
          color: black;
          padding: 10px;
          border: 0;
          box-shadow: none;
          border-radius: 0px;
        }

        button:hover {
          background: white;
        }

        fieldset {
          border: 0;
          padding: 10px;
        }

        .select-code, .select-markdown, .select-raw {
          padding: 10px;
        }

        .input {
          margin-top: 10px;
        }
      </style>

      <div class="container">
        <fieldset>
          <input class="select-code"      type="radio" name="cell-choice"  value="code" checked>Code</input>
          <input class="select-markdown"  type="radio" name="cell-choice"  value="markdown">Markdown</input>
          <input class="select-raw"       type="radio" name="cell-choice"  value="raw">Raw</input>
        
          <wc-codemirror class="input"
            style="width: 570px; height: 100%;"
            mode="javascript" 
            theme="eclipse">
          </wc-codemirror>
          
          <div class="output">
            <output class="console"></output><br>
            <output class="result"></output><br>
          </div>
        </fieldset>

        <div class="buttons">
          <button class="run-cell">Run cell</button>
          <button class="remove-cell">Remove cell</button>
          <button class="add-cell">Add cell below</button
        </div>
      </div>
    `;

    this.id = NotebookCell.#cellId;
    const cm = this.shadowRoot.querySelector('wc-codemirror');
    this.cm = cm;
    this.editor = cm.editor;
    this.editor.value = this.#source;

    this.editor.setOption('lineWrapping', true);
    this.editor.setOption('lineNumbers, true');
    this.editor.setOption('minLines', 10);
    this.editor.setOption('tabSize', 2)

    this.editor.setSize('100%', '100%');

    const run = this.run.bind(this);
    this.editor.setOption("extraKeys", {
      'Ctrl-Enter': run
    });

    this.editor.refresh();   

    this.runCellBtn = this.shadowRoot.querySelector('.run-cell');
    this.runCellBtn.onclick = run.bind(this); 

    this.addCellBtn = this.shadowRoot.querySelector('.add-cell');
    this.addCellBtn.onclick = () => {
      this.insertAdjacentHTML('afterend', "<notebook-cell></notebook-cell>");
    }
    
    this.result = this.shadowRoot.querySelector('.result');
    this.console = this.shadowRoot.querySelector('.console');

    [...this.shadowRoot.querySelectorAll('input[type="radio"]')].forEach((input) => {
      input.onchange = this.modeChanged.bind(this);
    })
    
    this.editor.focus();
  }

  modeChanged(){
    const cellType = this.shadowRoot.querySelector('input[type="radio"]:checked').value;
    this.#cell_type = cellType;    

    this.editor.setOption('mode', cellType);
    this.editor.refresh();
  }

  clearOutput(){
    this.#output = '';
    
    this.result.value = '';
    this.result.innerHTML = '';

    this.console.value = '';
    this.console.innerHTML = '';
  }

  run(){
    this.modeChanged();
    const cellType = this.shadowRoot.querySelector('input:checked').value;
    
    switch(cellType){
      case 'code':
        this.runCode();
        break;
      case 'raw':
        this.runRaw();
        break;
      case 'markdown':
        this.runMarkdown();
        break;
    }
  }

  runRaw(){    
    this.clearOutput();

    this.#source = this.cm.value;
    this.#output = this.#source;
    this.result.value = this.#output;
  }

  runMarkdown(){
    this.clearOutput();
    this.#source = this.cm.value; 
    this.#output = marked.parse(this.#source);
    this.result.value - this.#output;

    this.visualizeHTML();
  }

  runCode(){
    this.clearOutput();

    this.#source = this.cm.value;
    const log = console.log;
    let logged = '';

    console.log = function(){
      logged = logged.concat(...[...arguments].map(arg => `${arg}<br />`));
      log.apply(console, arguments);
    }

    try {
      this.#output = window.eval(this.#source);
    }catch(e){
      this.#output = `<p class="error">${e}</p>`
    }
    console.log = log;

    switch(this.classifyOutput()){
      case 'vega':
        this.visualizeVega();
        break;
      case 'array':
        this.visualizeArray();
        break;
      case 'html':
        this.visualizeHTML();
        break;
      case 'object':
        this.visualizeObject();
        break;
      case 'url':
        this.visualizeURL();
        break;
      default:
        this.result.value = this.#output;
        break;
    }

    this.console.innerHTML = logged;
  }

  classifyOutput(){
    if(this.isArray()) return 'array';
    if(this.isVega()) return 'vega';
    if(this.isHTML()) return 'html';
    if(this.isObject()) return 'object';
    if(this.isUrl()) return 'url';
  }

  fromJSON(cell){
    this.#metadata = cell.metadata ?? {};

    this.#cell_type = cell.cell_type;
    this.shadowRoot.querySelector(`input[value="${this.#cell_type}"]`).setAttribute('checked', 'checked')

    this.#source = cell.source;
    this.editor.setValue(cell.source)
    if(typeof this.#source == 'array') this.#source = this.#source.join('');
    this.editor.value = this.#source;

    this.#output = cell.output;
    if(typeof this.#output == 'array') this.#output = this.#output.join('');
    this.result.value = this.#output;
  }

  toJSON(){
    this.#source = this.editor.getValue();
    this.#cell_type = this.shadowRoot.querySelector('input[type="radio"]:checked').value;

    return {
      "cell_type": this.#cell_type,
      "metadata": {},
      "source": this.#source,
      "output": this.#output
    }
  }

  isUrl(){
    let url;
    
    // "if it doesn't crash, it has"
    try {
      url = new URL(this.#output);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }

  visualizeURL(){
    if(this.#output.startsWith('http') && this.#output.endsWith('.mjs')){
      var script = document.createElement("script");
      script.type = "module";
      script.src = this.#output;
      document.querySelector('head').appendChild(script);
    }else if(this.#output.startsWith('http') && this.#output.endsWith('.js')){
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = this.#output;
      document.querySelector('head').appendChild(script);
    }else if(this.#output.startsWith('http') && this.#output.endsWith('.css')){
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = this.#output;
      document.querySelector('head').appendChild(link);
    }

    this.result.innerHTML = `Added ${this.#output} to the document head`;
  }

  isHTML(){
    try {
      const fragment = new DOMParser().parseFromString(this.#output,"text/html");
      return fragment.body.children.length > 0;
    } catch(error) { ; }  
    return false;
  }

  visualizeHTML(){
    this.result.innerHTML = this.#output;
  }

  isVega(){
    if(!this.#output) return false;
    return this.#output.data && this.#output.encoding && this.#output.mark;
  }

  visualizeVega(){
    vegaEmbed(
      this.result,
      this.#output
    )
  }

  isArray(){
    return this.#output instanceof Array;
  }
  
  visualizeArray(){
    const table = document.createElement('table');
    
    const thead = document.createElement('thead');
    const headTr = document.createElement('tr');
    const indexTh = document.createElement('th');
    indexTh.innerHTML = "Index";
    const valueTh = document.createElement('th');
    valueTh.innerHTML = "Value";
    headTr.appendChild(indexTh);
    headTr.appendChild(valueTh);
    thead.appendChild(headTr);

    const tbody = document.createElement('tbody');
    for(let i=0; i<this.#output.length; i++){
      const tr = document.createElement('tr');
      
      const index = document.createElement('td');
      index.innerHTML = i;
      const value = document.createElement('td');
      value.innerHTML = JSON.stringify(this.#output[i]);

      tr.appendChild(index);
      tr.appendChild(value);

      tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    this.result.appendChild(table);
  }

  isObject(){
    return !this.isVega() && this.#output instanceof Object 
  }

  visualizeObject(){
    const table = document.createElement('table');
    
    const thead = document.createElement('thead');
    const headTr = document.createElement('tr');
    const indexTh = document.createElement('th');
    indexTh.innerHTML = "Key";
    const valueTh = document.createElement('th');
    valueTh.innerHTML = "Value";
    headTr.appendChild(indexTh);
    headTr.appendChild(valueTh);
    thead.appendChild(headTr);

    const tbody = document.createElement('tbody');
    for(let i of Object.keys(this.#output)){
      const tr = document.createElement('tr');
      
      const index = document.createElement('td');
      index.innerHTML = i;
      const value = document.createElement('td');
      value.innerHTML = JSON.stringify(this.#output[i]);

      tr.appendChild(index);
      tr.appendChild(value);

      tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    this.result.appendChild(table);
  }
}

customElements.define('notebook-cell', NotebookCell);