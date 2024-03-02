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