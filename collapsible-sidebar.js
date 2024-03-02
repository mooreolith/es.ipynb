class CollapsibleSidebar extends HTMLElement {
  static observedAttributes = [];
  
  constructor(){
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback(){ 
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          border-right: 1px dashed black;
          padding-top: 20px;
          padding-left: 20px;
          padding-right: 20px;
          margin-right: 20px;
        }
        .show {
          display: inline-block;
        }
        .hide {
          display: none;
        }
      </style>
      <span class="show-menu hide"> (&gt;) </span>
      <div class="menu show">
        <span class="hide-menu"> (&lt;) </span>
        <ul>
          <slot name="menu-item"></slot>
        </ul>
      </div>
    `;

    const showMenu = this.shadowRoot.querySelector('.show-menu');
    const hideMenu = this.shadowRoot.querySelector('.hide-menu');
    const menu = this.shadowRoot.querySelector('.menu');

    showMenu.onclick = this.showMenu.bind(this);
    hideMenu.onclick = this.hideMenu.bind(this);
  }

  showMenu(){
    const showMenu = this.shadowRoot.querySelector('.show-menu')
    showMenu.classList.remove('show');
    showMenu.classList.add('hide')

    const menu = this.shadowRoot.querySelector('.menu');
    menu.classList.remove('hide');
    menu.classList.add('show');
  }

  hideMenu(){
    const showMenu = this.shadowRoot.querySelector('.show-menu')
    showMenu.classList.remove('hide');
    showMenu.classList.add('show');

    const menu = this.shadowRoot.querySelector('.menu');
    menu.classList.remove('show');
    menu.classList.add('hide');
  }
  
}

customElements.define('collapsible-sidebar', CollapsibleSidebar);