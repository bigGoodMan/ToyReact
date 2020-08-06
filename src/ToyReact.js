class ElementWrap{
  constructor(tagName) {
    this.root = document.createElement(tagName);
  }
  setAttribute(key, value) {
    this.root.setAttribute(key, value)
  }
  appendChild(vchild){
    vchild.mountTo(this.root)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}
class TextWrap{
  constructor(content){
    this.root = document.createTextNode(content)
  }
  mountTo(parent) {
    parent.appendChild(this.root)
  }
}

export class Component{
  constructor() {
    this.children = []
  }
  setAttribute(key, value) {
    this[key] = value;
  }
  mountTo(parent) {
    let vDom = this.render();
    vDom.mountTo(parent)
  }
  appendChild(vchild){
    this.children.push(vchild)
  }
}

export let ToyReact = {
  createElement(componentName, attributes, ...children) {
    let element;
    console.log(componentName, children)
    if (typeof componentName === "string") {
      element = new ElementWrap(componentName)
    } else {
      element = new componentName;
    }
    // const element = document.createElement(componentName)
    
    for(const name in attributes) {
      element.setAttribute(name, attributes[name])
    }
    let insertChildren = (children) => {
      for(let child of children) {
         if(typeof child === "object" && child instanceof Array) {
          insertChildren(child)
        } else {
          if (!(child instanceof Component) && !(child instanceof ElementWrap) && !(child instanceof TextWrap)) {
            child = String(child)
          }
          if (typeof child === "string") {
            child = new TextWrap(child)
          }
        element.appendChild(child)
        }
      }
    }
    insertChildren(children)
    // debugger;
    return element
  },
  render(vdom, element) {
    vdom.mountTo(element)
  }
}