class ElementWrap{
  constructor(tagName) {
    this.root = document.createElement(tagName);
  }
  setAttribute(key, value) {
    if (key.match(/^on([\s\S]+)$/)) {
      const eventName = RegExp.$1.replace(/^[\s\S]/, p1 => p1.toLowerCase())
      this.root.addEventListener(eventName, value)
    }
    if (key === "className") {
      key = "class"
    }
    this.root.setAttribute(key, value)
  }
  appendChild(vchild){
    let range = document.createRange();
    if (this.root.children.length) {
      range.setStartAfter(this.root.lastChild);
      range.setEndAfter(this.root.lastChild)
    } else {
      range.setStart(this.root, 0)
      range.setEnd(this.root, 0)
    }
    vchild.mountTo(range)
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}
class TextWrap{
  constructor(content){
    this.root = document.createTextNode(content)
  }
  mountTo(range) {
    range.deleteContents();
    range.insertNode(this.root);
  }
}

export class Component{
  constructor() {
    this.children = []
    this.props = Object.create(null)
  }
  setAttribute(key, value) {
    this.props[key] = value
    this[key] = value;
  }
  mountTo(range) {
    this.range = range
    this.update()
  }
  update() {
    let placeholder = document.createComment("placeholder")
    let range = document.createRange()
    range.deleteContents()
    range.setStart(this.range.endContainer, this.range.endOffset)
    range.setEnd(this.range.endContainer, this.range.endOffset)
    range.insertNode(placeholder)
    this.range.deleteContents();
    let vDom = this.render();
    vDom.mountTo(this.range);
    // placeholder.parentNode.removeChild(placeholder);
  }
  appendChild(vchild){
    this.children.push(vchild)
  }
 setState(state, fn = () => {}){
    let merge = (oldState, newState) => {
      for (let key in newState) {
        if (typeof newState[key] === "object" && newState[key] !== null) {
          if (typeof oldState[key] !== "object") {
            if (Array.isArray(newState[key])) {
              oldState[key] = []
            } else {
              oldState[key] = {}
            }
          }
          merge(oldState[key], newState[key])
        } else {
          oldState[key] = newState[key]
        }
      }
    }
    if (!this.state && state) {
      this.state = {}
    }
    merge(this.state, state)
    this.update();
  }
}

export let ToyReact = {
  createElement(componentName, attributes, ...children) {
    let element;
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
          if (child === null || child === void 0) {
            child = ""
          }
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
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild)
    } else {
      range.setStart(element, 0)
      range.setEnd(element, 0)
    }
    vdom.mountTo(range)
  }
}