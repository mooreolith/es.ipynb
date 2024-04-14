/*
  File Upload
*/
document.addEventListener('keydown', e => {
  if(e.ctrlKey && e.key == 's'){
    e.preventDefault();
    
    const nb = document.querySelector('es-notebook');
    nb.save();
  }
})

const container = document.querySelector('.container');
const reader = new FileReader();
let filename;

reader.onload = (e) => {
  const json = JSON.parse(e.target.result);

  container.innerHTML = '';
  const nb = document.createElement('es-notebook');
  container.appendChild(nb);

  nb.fromJSON(json);
};

const input = document.createElement('input')
input.style.setProperty('display', 'none');
input.type = "file";
input.onchange = function(){
  const file = this.files[0];
  filename = file.name
  reader.readAsText(file);
}
document.body.appendChild(input); 

function upload(){
  input.click();
}

/* File Download */
function save(){
  const nb = document.querySelector('es-notebook');
  nb.save();
}

function exampleNotebook(){
  const json = {
    "metadata": {
      "kernel_info": {
        "name": "Browser Javascript"
      },
      "name": "Reference Notebook"
    },
    "nbformat": 5,
    "nbformat_minor": 9,
    "cells": [
      {
        "cell_type": "markdown",
        "metadata": {},
        "source": "# es.ipynb reference notebook\n\nWelcome to the most recent installment of es.ipynb. This is a Jupyter-like notebook, but for Browser-side JavaScript, and including a handful of bells and whistles.\n\n## Features\n\n* **Basic calculator stuff:** You can try basic operations. The last value in a Code cell will get displayed. \n* **HTML formatted text:** A string consisting of HTML is rendered as an html element in the cell output.\n* **Tables for objects and arrays:** A **list** is rendered as a table with the array index in the first column, and the list value in the second column. An **object** is also rendered as a table, though that only applies to the first level.\n* **Console.log output:** output written to console.log is displayed below the cell, separate from the output displaying the last value.\n* **vega-lite specs:** This notebook can render all kinds of [vega-lite](https://vega.github.io/vega-lite/examples/bar.html) charts.\n* **external javascript files:** An output string consisting of a url is added as a script tag to this page, where its contents are accessible to the cell. ",
        "output": "<h1>es.ipynb reference notebook</h1>\n<p>Welcome to the most recent installment of es.ipynb. This is a Jupyter-like notebook, but for Browser-side JavaScript, and including a handful of bells and whistles.</p>\n<h2>Features</h2>\n<ul>\n<li><strong>Basic calculator stuff:</strong> You can try basic operations. The last value in a Code cell will get displayed. </li>\n<li><strong>HTML formatted text:</strong> A string consisting of HTML is rendered as an html element in the cell output.</li>\n<li><strong>Tables for objects and arrays:</strong> A <strong>list</strong> is rendered as a table with the array index in the first column, and the list value in the second column. An <strong>object</strong> is also rendered as a table, though that only applies to the first level.</li>\n<li><strong>Console.log output:</strong> output written to console.log is displayed below the cell, separate from the output displaying the last value.</li>\n<li><strong>vega-lite specs:</strong> This notebook can render all kinds of <a href=\"https://vega.github.io/vega-lite/examples/bar.html\">vega-lite</a> charts.</li>\n<li><strong>external javascript files:</strong> An output string consisting of a url is added as a script tag to this page, where its contents are accessible to the cell.</li>\n</ul>\n"
      },
      {
        "cell_type": "code",
        "metadata": {},
        "source": "let n = 1 + 1;\nlet m = n * 2;\n\nconsole.log(\"n:\", n, \"m:\", m)\n\"Hello, Worlds\"",
        "output": "Hello, Worlds"
      },
      {
        "cell_type": "code",
        "metadata": {},
        "source": "let str = '<span style=\"background-color: red; color: orange;\">World: Hello, back</span>'\nstr",
        "output": "<span style=\"background-color: red; color: orange;\">World: Hello, back</span>"
      },
      {
        "cell_type": "code",
        "metadata": {},
        "source": "let list = [1, 2, 4, 8, 16, 32, 16, 8, 4, 2, 1]\nlist",
        "output": [
          1,
          2,
          4,
          8,
          16,
          32,
          16,
          8,
          4,
          2,
          1
        ]
      },
      {
        "cell_type": "code",
        "metadata": {},
        "source": "let object = {\"hero_type\": \"Cat monster\", \"health\": 100, attack: 1.0}\nobject",
        "output": {
          "hero_type": "Cat monster",
          "health": 100,
          "attack": 1
        }
      },
      {
        "cell_type": "code",
        "metadata": {},
        "source": "for(var i=10; i>=0; i--){ console.log(i, ' ') };\nconsole.log(\"Liftoff!\")\n''",
        "output": ""
      },
      {
        "cell_type": "code",
        "metadata": {},
        "source": "// from https://vega.github.io/vega-lite/examples/bar.html\nlet spec = {\n  \"$schema\": \"https://vega.github.io/schema/vega-lite/v5.json\",\n  \"description\": \"A simple bar chart with embedded data.\",\n  \"data\": {\n    \"values\": [\n      {\"a\": \"A\", \"b\": 28}, {\"a\": \"B\", \"b\": 55}, {\"a\": \"C\", \"b\": 43},\n      {\"a\": \"D\", \"b\": 91}, {\"a\": \"E\", \"b\": 81}, {\"a\": \"F\", \"b\": 53},\n      {\"a\": \"G\", \"b\": 19}, {\"a\": \"H\", \"b\": 87}, {\"a\": \"I\", \"b\": 52}\n    ]\n  },\n  \"mark\": \"bar\",\n  \"encoding\": {\n    \"x\": {\"field\": \"a\", \"type\": \"nominal\", \"axis\": {\"labelAngle\": 0}},\n    \"y\": {\"field\": \"b\", \"type\": \"quantitative\"}\n  }\n}\n\nspec",
        "output": {
          "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
          "description": "A simple bar chart with embedded data.",
          "data": {
            "values": [
              {
                "a": "A",
                "b": 28
              },
              {
                "a": "B",
                "b": 55
              },
              {
                "a": "C",
                "b": 43
              },
              {
                "a": "D",
                "b": 91
              },
              {
                "a": "E",
                "b": 81
              },
              {
                "a": "F",
                "b": 53
              },
              {
                "a": "G",
                "b": 19
              },
              {
                "a": "H",
                "b": 87
              },
              {
                "a": "I",
                "b": 52
              }
            ]
          },
          "mark": "bar",
          "encoding": {
            "x": {
              "field": "a",
              "type": "nominal",
              "axis": {
                "labelAngle": 0
              }
            },
            "y": {
              "field": "b",
              "type": "quantitative"
            }
          }
        }
      },
      {
        "cell_type": "code",
        "metadata": {},
        "source": "\"https://unpkg.com/brain.js\"",
        "output": "https://unpkg.com/brain.js"
      }
    ]
  };

  const container = document.querySelector('.container');
  container.innerHTML = '';
  const nb = document.createElement('es-notebook');
  container.appendChild(nb);

  nb.fromJSON(json);
}

(async function(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if(urlParams.has('url')){
    const url = decodeURI(urlParams.get('url'))
    const response = await fetch(url);
    const json = await response.json();

    if(json){
      const container = document.querySelector('.container');
      const nb = document.createElement('es-notebook');

      container.innerHTML = '';
      container.appendChild(nb);

      nb.fromJSON(json);
    }
  }
})();