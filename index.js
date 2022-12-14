var RSNBApp = angular.module('RSNBApp', ['ui.codemirror']);
RSNBApp.filter('unsafe', function($sce) { return $sce.trustAsHtml; });
var RSNBController = RSNBApp.controller("RSNBController", 
  ["$scope", "$http", "$sce", "$element", "$document",
  function($scope, $http, $sce, $element, $document){
  $scope.notebooks = [];
  $scope.current = null;
  $scope.currents = [];

  $scope.currentCell = null;
      
  $scope.reservedNames = [
    'initialized', 
  ];
      
  $scope.newline = '\n';
    
  // https://stackoverflow.com/a/10080841
  $("textarea.code.cell").bind('input', function(e) {
    while($(this).outerHeight() < this.scrollHeight + parseFloat($(this).css("borderTopWidth")) + parseFloat($(this).css("borderBottomWidth"))) {
        $(this).height($(this).height()+1);
    };
  });
  
  $scope.storeNotebook = function(notebook){
    if(!notebook){
      notebook = $scope.current;
    }
      
    var nb = Object.assign({
      "metadata" : {
        "kernel_info": {
            "name" : "Browser ECMAScript"
        },
        "language_info": {
            "name" : "ECMAScript",
            "version": "262",
            "codemirror_mode": "javascript"
        }
      },
      "nbformat": 4,
      "nbformat_minor": 0,
      "cells" : [
      ]
    }, notebook);

    nb.cells = nb.cells.map((cell, i) => {
      var cellCopy = Object.assign({}, cell)
      Object.assign(cellCopy, {
        editor: null, 
        cellSource: null
      });
        
      // ! is there enough information here to justify the following line of code? 
      // I am trying to decide which array is newer, without knowing which on is. 
      cellCopy.source = cell.cellSource ? cell.cellSource.split($scope.newline) : cell.source;
      
      if(!cellCopy.source) cellCopy.source = [];
      cellCopy.source = cellCopy.source.map(line => {
        if(!line.endsWith('\n')){
          return `${line}\n`;
        }else{
          return line;
        }
      });
      delete cellCopy.cellSource;
      delete cellCopy.index;
      delete cellCopy.editor;
      delete cellCopy.execution_count;
      delete cellCopy.visualization;
      cellCopy.outputs = [];
        
      return cellCopy;
    });
      
    delete nb.index;
    var name = notebook.name;
    
    window.localStorage.setItem(name, JSON.stringify(nb));
  }

  $scope.setCurrent = function(notebook, cell){
    $scope.current = notebook;
    $scope.currentCell = cell;
  }
      
  $scope.initMarkdownCell = function(nbIndex, cellIndex){
    var elem = document.querySelector(`.notebook${nbIndex} .markdown.cell${cellIndex}`);
    if(!elem) return;
      
    var cell = $scope.notebooks[nbIndex].cells[cellIndex];
    if(!cell) return;
      
    if(cell.editor){
      cell.editor.codemirror.getWrapperElement().remove();
      delete cell.editor;
      delete cell.editorOptions;
    }
    
    if(!cell.editor){
      cell.editorOptions = {
        lineWrapping: true,
        mode: 'markdown'
      };
      cell.editor = new Editor(cell.editorOptions);
    }
      
    cell.editor.render(document.querySelector(`.notebook${nbIndex} .markdown.cell${cellIndex}`));
    cell.editor.codemirror.setValue(cell.source.join(''));
    cell.editor.codemirror.refresh();
    cell.cellSource = cell.source.join('')
    
    return cell;
  }
      
  $scope.initAllMarkdownCells = function(notebook){
    if(!notebook.index){
      notebook.index = $scope.notebooks.indexOf(notebook);
    }
      
    for(var i=0; i<notebook.cells.length; i++){
      $scope.initMarkdownCell(notebook.index, i);
    }
  }

  $scope.initCodeCell = function(nbIndex, cellIndex){  
    var elem = document.querySelector(`.notebook${nbIndex} .code.cell${cellIndex}`);
    if(!elem) return;
      
    var cell = $scope.notebooks[nbIndex].cells[cellIndex];
    if(!cell) return;
      
    if(cell.editor){
      cell.editor.codemirror.getWrapperElement().remove();
      delete cell.editor;
      delete cell.editorOptions;
    }
      
    if(!cell.editor){
      cell.editorOptions = {
        mode:  "javascript",
        lineNumbers: true, 
      };

      cell.editor = {
        codemirror: CodeMirror.fromTextArea(elem, cell.editorOptions)
      };

      cell.editor.codemirror.getWrapperElement().addEventListener('keyup', function(event){
        console.log(event.which, event.ctrlKey)
        if(event.which == 13 && event.ctrlKey){
          $scope.run(cell, cell.source)
        }
      });

    }

    cell.editor.codemirror.setValue(cell.source.join(''));
    cell.editor.codemirror.setOption('theme', 'eclipse');
    cell.cellSource = cell.source.join($scope.newline);

    return cell;
  }

  $scope.initAllCodeCells = function(notebook){
    if(!notebook.index){
      notebook.index = $scope.notebooks.indexOf(notebook);
    }
      
    for(var i=0; i<notebook.cells.length; i++){
      $scope.initCodeCell(notebook.index, i);
    }
  }
      
  $scope.display = function(notebook){
    if(!notebook) return;
    $scope.current = notebook;
    $scope.currents = [$scope.current];

    $scope.currentCell = $scope.current.cells[0];
    // $scope.initAllMarkdownCells(notebook);
    // $scope.initAllCodeCells(notebook)
  }

  $scope.loadNotebooks = function(){
    $scope.notebooks = [];
    
      
    var notebookNames = Object.keys(window.localStorage).filter(name => {
      return $scope.reservedNames.indexOf(name) === -1; 
    });
    for(var i=0; i<notebookNames.length; i++){
      var notebook = JSON.parse(localStorage.getItem(notebookNames[i]));
      if(!notebook) return;
      $scope.notebooks.push(notebook);
    }
    
    if($scope.notebooks.length){
      $scope.display($scope.notebooks[0])
    }
      
    return $scope.notebooks;
  }
    
  $scope.loadNotebooks();
    
  $scope.upload = function(){
    var form = document.querySelector("form");
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const files = document.querySelector('[type=file]').files;

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let notebook = JSON.parse(await file.text());
        notebook.name = file.name;
        
        var nb = null;
        if(nb = $scope.notebooks.findIndex(nb => nb.name === notebook.name) === -1){
          $scope.notebooks.push(notebook);
        }else{
          $scope.notebooks[nb] = notebook;
        }
        
        $scope.storeNotebook(notebook);
        $scope.display(notebook);
      }
    })
  }

  $scope.addNotebook = function(){
    var name = prompt('A Name for the Notebook?');
    if(!name) return;
    if(!name.endsWith('.es.ipynb')){
      name += '.es.ipynb'
    }
    var notebook = {
     "cells": [
      {
       "cell_type": "code",
       "metadata": {},
       "source": ``,
      }
     ],
     "metadata": {
      "kernel_info": {
       "name": "Javascript (Browser)"
      },
      "language_info": {
        "name" : "ECMAScript",
        "version": "6",
        "codemirror_mode": "javascript"
      }
     },
     "nbformat": 4,
     "nbformat_minor": 0
    }
      
    notebook.name = name;
      
    $scope.notebooks.push(notebook);
    // $scope.initAllMarkdownCells(notebook);
    // $scope.initAllCodeCells(notebook);

    $scope.storeNotebook(notebook);
    $scope.display(notebook);
  }

  $scope.removeNotebook = function(notebook){
    window.localStorage.removeItem(notebook.name);
    $scope.current = null;
    $scope.loadNotebooks();
  }

  $scope.loadScript = function loadScript(url, callback){
    var script = document.createElement("script")
    script.type = "text/javascript";
    if (script.readyState){  //IE
      script.onreadystatechange = function(){
        if (script.readyState == "loaded" ||
            script.readyState == "complete"){
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {  //Others
      script.onload = function(){
        callback(script.textContent);
      };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
    return 
  }
    
  $scope.run = async function(cell, code){
    switch(cell.cell_type){
      case 'code':
        cell.source = code.split($scope.newline);
        var result = window.eval(code);

        cell.outputs = [{
          "output_type" : "application/json",
          "execution_count": null,
          "data" : result,
          "metadata": {}
        }];
        cell.execution_count = null;

        if($scope.isVega($scope.getOutput(cell))){
          await $scope.visualize(cell);
        }

        break;

      case 'external_code':
        cell.source = code;
        $scope.loadScript(cell.source, function(code){
          var result = window.eval(code);

          cell.outputs = [{
            "output_type" : "application/json",
            "execution_count": 0,
            "data": result,
            "metadata": {}
          }];
          cell.execution_count = cell.execution_count === null ? 0 : cell.execution_count + 1;
        })
        break;
    }

    return result;
  }

  $scope.getOutput = function(cell){
    return cell.outputs.length ? cell.outputs[0].data : undefined;
  }
    
  $scope.runAll = function(notebook){
    notebook.cells = notebook.cells.map(function(cell){
      if(cell.cell_type == 'code' || 'external_code'){
        $scope.run(cell, cell.cellSource);
      }
      return cell;
    });
  }
    
  $scope.clearAll = function(notebook){
    notebook.cells = notebook.cells.map(cell => {
      cell.source = [];
      return cell;
    })
  }

  $scope.downloadNotebook = function(notebook){
    download(localStorage.getItem(notebook.name), `${notebook.name}${notebook.name.endsWith('.es.ipynb') ? '' : '.es.ipynb'}`, 'application/x-ipynb+json')
  }

  $scope.addCell = function(notebook){
    notebook.cells.push({
       "cell_type": "code",
       "execution_count": null,
       "metadata": {},
       "outputs": [],
       "source": []
      })
  }
      
  $scope.addCellAt = function(notebook, i){
    notebook.cells.splice(i, 0, {
      "cell_type": "code",
      "execution_count": null,
      "metadata": {},
      "outputs": [],
      "source": []
    })
  }

  $scope.removeCell = function(notebook, cell){
    notebook = notebook.cells.splice(notebook.cells.indexOf(cell), 1)
  }
    
  $scope.isObject = function(potObj){
    return !$scope.isHTML(potObj) && potObj instanceof Object;
  }
    
  $scope.isArray = function(potArr){
    return potArr instanceof Array;
  }

  $scope.isHTML = function(potHTML){
    try {
      const fragment = new DOMParser().parseFromString(potHTML,"text/html");
      return fragment.body.children.length>0
    } catch(error) { ; }  
    return false;
  }
      
  $scope.isVega = function(potVega){
    if(!potVega) return false;
    return potVega.data && potVega.encoding && potVega.mark;
  }
      
  $scope.visualize = function(cell){
    if($scope.isVega($scope.getOutput(cell))){
      var output = $scope.getOutput(cell);
      cell.show = false;
      vegaEmbed(
        `.output${cell.index}`, 
        output
      ).then(result => {
          cell.visualization = result;
        }
      )
    }
  }
      
  $scope.visualizeAll = function(notebook){
    notebook.cells.forEach(cell => {
      $scope.visualize(cell);
    })
  }
      
  $scope.hideVisualiation = function(cell){
    if(cell.visualization){
      delete cell.visualization;
    }
  }

  $(window).bind('keydown', function(event){
    if(event.ctrlKey && event.which == 13){
      $scope.run()
    }
  
    if (event.ctrlKey || event.metaKey) {
      switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
          event.preventDefault();
          $scope.storeNotebook($scope.current);
          break;
      }
    }
  });
      
  this.$onInit = function(){
    if(!window.localStorage.getItem('initialized')){
      $http.get('Greetings.es.ipynb', {})
      .then(response => {
        var notebook = response.data;
        $scope.storeNotebook(notebook);
        $scope.loadNotebooks();
      });
    
      window.localStorage.setItem('initialized', true);
    }
      
    // $scope.notebooks.forEach((notebook, i) => {
    //  $scope.initAllCodeCells(notebook);
    //  $scope.initAllMarkdownCells(notebook);
    // })
  }
}])