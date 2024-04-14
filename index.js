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

function reset(){
  const container = document.querySelector('.container');
  container.innerHTML = '';
  
  const nb = document.createElement('es-notebook');
  container.appendChild(nb);
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