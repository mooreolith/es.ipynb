class CollapsibleSidebar extends HTMLElement {
  static observedAttributes = [];
  
  constructor(){
    super();
    this.attachShadow({mode: 'open'});
  }

  connectedCallback(){ 
    this.shadowRoot.innerHTML = `
      <style>
        @import url("collapsible-sidebar-window.css") screen and (width > 480px);
        @import url("collapsible-sidebar-mobile.css") screen and (width <= 480px);
      </style>
      
      <span class="show-menu show"> &#9776; </span>
      <span class="hide-menu hide"> &#9776; </span>
      <div class="menu hide">
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

    const hideMenu = this.shadowRoot.querySelector('.hide-menu')
    hideMenu.classList.remove('hide');
    hideMenu.classList.add('show');

    const menu = this.shadowRoot.querySelector('.menu');
    menu.classList.remove('hide');
    menu.classList.add('show');
  }

  hideMenu(){
    const showMenu = this.shadowRoot.querySelector('.show-menu')
    showMenu.classList.remove('hide');
    showMenu.classList.add('show');

    const hideMenu = this.shadowRoot.querySelector('.hide-menu')
    hideMenu.classList.remove('show');
    hideMenu.classList.add('hide');

    const menu = this.shadowRoot.querySelector('.menu');
    menu.classList.remove('show');
    menu.classList.add('hide');
  }
  
}

customElements.define('collapsible-sidebar', CollapsibleSidebar);
