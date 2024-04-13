# es.ipynb Reference
Welcome to the most recent installment of [es.ipynb](https://mooreolith.github.io/es.ipynb). This is a Jupyter-like notebook, but for Browser-side JavaScript, and including a handful of bells and whistles.

## Running
You don't have to install anything to run this program. It lives in the browser, and currently runs on github pages. Follow [this link](https://mooreolith.github.io/es.ipynb) to try it out now, and don't forget to save your work (CTRL-S, or Download).

## Installation
You can install it through

```sh
git clone https://github.com/mooreolith/es.ipynb.git
python3 -m http.server
```

Serve the es.ipynb directory (some of the file references are hard coded that way, I wrote this to run on github pages), so *not* from within the es.ipynb directory.

```sh
python3 -m http.server
```

Now you can open your browser at http://localhost:8000/es.ipynb.

## Features
If this is your first time here, download the [reference notebook](https://raw.githubusercontent.com/mooreolith/es.ipynb/main/example/Reference%20Notebook.es.ipynb), and upload it using the es.ipynb Upload link. Then click "Run All"

* **Basic calculator stuff:** You can try basic operations. The last value in a Code cell will get displayed. 
* **HTML formatted text:** A string consisting of HTML is rendered as an html element in the cell output.
* **Tables for objects and arrays:** A **list** is rendered as a table with the array index in the first column, and the list value in the second column. An **object** is also rendered as a table, though that only applies to the first level.
* **Console.log output:** output written to console.log is displayed below the cell, separate from the output displaying the last value.
* **vega-lite specs:** This notebook can render all kinds of [vega-lite](https://vega.github.io/vega-lite/examples/bar.html) charts.
* **external javascript files:** An output string consisting of a url is added as a script tag to this page, where its contents are accessible to the cell.

Add and remove cells using the appropriate buttons underneath the cells. CTRL-Enter will run a selected cell, and CTRL-S will save the current notebook to a file you can download (and reupload).
