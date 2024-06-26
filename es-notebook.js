class ESNotebook extends HTMLElement {
  #name = 'Untitled Notebook';
  #metadata = {
    "kernel_info": {
      "name": "Browser Javascript"
    },
    "language_info": {
      "name": "Javascript",
      "version": "ECMAScript 2019",
      "codemirror_mode": "javascript"
    },
    "nbformat": 5,
    "nbformat_minor": 9
  };
  #cells = [];

  constructor(){
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback(){
    this.shadowRoot.innerHTML = `
      <style>
        @import url("es-notebook-window.css") screen and (width > 480px);
        @import url("es-notebook-mobile.css") screen and (width <= 480px);
      </style>

      <div>
        <div class="container">
          <h1 class="notebook-title" contenteditable="true">${this.#name}</h1>
          <button class="add-cell">Add Cell</button>
          <button class="run-all">Run All</button>
          <button class="clear-output">Clear Output</button>
        </div>

        <br />
        <div class="footer">
          <button class="add-cell">Add Cell</button>
        </div>
      </div>
    `;

    const header = this.shadowRoot.querySelector('h1');
    header.addEventListener('input', e => {
      this.#name = e.target.innerHTML;
    })

    const addCellBtns = [...this.shadowRoot.querySelectorAll('.add-cell')];
    addCellBtns.forEach(addCellBtn => addCellBtn.onclick = this.addCell.bind(this));

    const runAllBtn = this.shadowRoot.querySelector('.run-all');
    runAllBtn.onclick = () => {
      const cells = this.shadowRoot.querySelectorAll('notebook-cell');
      for(let i=0; i<cells.length; i++){
        cells[i].run();
      }
    }

    const clearOutputBtn = this.shadowRoot.querySelector('.clear-output');
    clearOutputBtn.onclick = () => {
      const cells = this.shadowRoot.querySelectorAll('notebook-cell');
      for(let i=0; i<cells.length; i++){
        cells[i].clearOutput();
      }
    }

    this.container = this.shadowRoot.querySelector('.container');
  }

  runAll(){
    const cells = this.container.querySelectorAll('notebook-cell');
    for(let i=0; i<cells.length; i++){
      cell.run();
    }
  }

  addCellFrom(cellJSON){
    const cell = document.createElement('notebook-cell');
    this.container.appendChild(cell);
    cell.fromJSON(cellJSON);

    const removeCellBtn = cell.shadowRoot.querySelector('.remove-cell');
    removeCellBtn.onclick = this.removeCell.bind(this, cell);
  }

  addCell(){
    const cell = document.createElement('notebook-cell');
    this.container.appendChild(cell);

    const removeCellBtn = cell.shadowRoot.querySelector('.remove-cell');
    removeCellBtn.onclick = this.removeCell.bind(this, cell);
  }

  removeCell(cell){
    cell.remove();
  }

  save(){
    const link = document.createElement('a');

    const json = this.toJSON();
    const name = this.#name.replace(/.br./, '');
    this.#name = name;
    const file = new File([JSON.stringify(json)], `${name}.es.ipynb`);

    link.href = URL.createObjectURL(file)
    link.download = file.name;

    link.click();
  }

  fromJSON(nbJSON){
    this.#metadata = nbJSON.metadata;
    this.#name = this.#metadata.name;
    this.shadowRoot.querySelector('.notebook-title').innerHTML = this.#name;

    for(let cellJSON of nbJSON.cells){
      this.addCellFrom(cellJSON);
    }
  }

  toJSON(){
    const name = this.#name.endsWith(' br ') ? 
      this.#name.slice(0, this.#name.length - 4) :
      this.#name;

    let json = {
      "metadata": {
        "name": name,
        "kernel_info": {
          "name": "Browser Javascript"
        }
      },
      "nbformat": 5,
      "nbformat_minor": 9,
      "cells": [...this.shadowRoot.querySelectorAll('notebook-cell')]
        .map(cell => cell.toJSON())
    }
    
    return json;
  }
}

customElements.define('es-notebook', ESNotebook);