const childrenSymbol = Symbol("children")
class ElementWrap {
  constructor(type) {
    this.type = type;
    this.props = Object.create(null);
    this[childrenSymbol] = [];
    this.children = [];
  }
  setAttribute(key, value) {
    // if (key.match(/^on([\s\S]+)$/)) {
    //   const eventName = RegExp.$1.replace(/^[\s\S]/, p1 => p1.toLowerCase())
    //   this.root.addEventListener(eventName, value)
    // }
    // if (key === "className") {
    //   key = "class"
    // }
    // this.root.setAttribute(key, value)
    this.props[key] = value;
  }
  appendChild(vchild) {
    this[childrenSymbol].push(vchild);
    this.children.push(vchild.vdom);
    // let range = document.createRange();
    // if (this.root.children.length) {
    //   range.setStartAfter(this.root.lastChild);
    //   range.setEndAfter(this.root.lastChild)
    // } else {
    //   range.setStart(this.root, 0)
    //   range.setEnd(this.root, 0)
    // }
  }
  get vdom() {
    return this;
  }
  mountTo(range) {
    this.range = range;
    let placeholder = document.createComment("placeholder")
    let endRange = document.createRange();
    endRange.setStart(range.endContainer,range.endOffset)
    endRange.setEnd(range.endContainer,range.endOffset)
    endRange.insertNode(placeholder)
    range.deleteContents();
    let element = document.createElement(this.type);
    for (let key in this.props) {
      let value = this.props[key];
      if (key.match(/^on([\s\S]+)$/)) {
        const eventName = RegExp.$1.replace(/^[\s\S]/, (p1) =>
          p1.toLowerCase()
        );
        element.addEventListener(eventName, value);
      }
      if (key === "className") {
        key = "class";
      }
      element.setAttribute(key, value);
    }
    for (let child of this.children) {
      let range = document.createRange();
      if (element.children.length) {
        range.setStartAfter(element.lastChild);
        range.setEndAfter(element.lastChild);
      } else {
        range.setStart(element, 0);
        range.setEnd(element, 0);
      }
      child.mountTo(range);
    }
    range.insertNode(element);
  }
}
class TextWrap {
  constructor(content) {
    this.root = document.createTextNode(content);
    this.type = "#text";
    this.children = [];
    this.props = Object.create(null);
  }
  mountTo(range) {
    this.range = range;
    range.deleteContents();
    range.insertNode(this.root);
  }
  get vdom() {
    return this;
  }
}

export class Component {
  constructor() {
    this.children = [];
    this.props = Object.create(null);
  }
  get type() {
    return this.constructor.name;
  }
  setAttribute(key, value) {
    this.props[key] = value;
    this[key] = value;
  }
  mountTo(range) {
    this.range = range;
    this.update();
  }
  update() {
    let vdom = this.vdom;
    if (this.oldVdom ) {
      let isSameNode = (node1, node2) => {
        if (node1.type !== node2.type) {
          return false;
        }
        for (let key in node1.props) {
          const value1 = node1.props[key];
          const value2 = node2.props[key];
          // if (typeof value1 === "function" && typeof value2 === "function" && value1.toString() === value2.toString()) {
          //   continue;
          // }
          if (typeof value1 === "object" && typeof value2 === "object" && JSON.stringify(value1) === JSON.stringify(value2)) {
            continue;
          }
          if (node1.props[key] !== node2.props[key]) {
            return false;
          }
        }
        if (
          Object.keys(node1.props).length !== Object.keys(node2.props).length
        ) {
          return false;
        }
        return true;
      };
      let isSameTree = (node1, node2) => {
        if (!isSameNode(node1, node2)) {
          return false
        }
        if (node1.children.length !== node2.children.length) {
          return false;
        }
        for (let i = 0; i < node2.children.length; ++i) {
          if (!isSameTree(node1.children[i], node2.children[i])) {
            return false
          }
        }
        return true
      }

      // if (isSameTree(vdom, this.vdom)) {
      //   return;
      // }
      let replace = (newTree, oldTree, indent = "  ") => {
        console.log(indent + "replace:", {newTree, oldTree})
        if (isSameTree(newTree, oldTree)) {
          return;
        }
        if (!isSameNode(newTree, oldTree)) {
          newTree.mountTo(oldTree.range)
        } else {
          for (let i = 0; i < newTree.children.length; i++) {
            replace(newTree.children[i],oldTree.children[i], indent + "  ")
          }
        }
        
      }
      replace(vdom, this.oldVdom)
      console.log("new:", vdom);
      console.log("old:", this.dom);
    } else {
      vdom.mountTo(this.range);
    }
    this.oldVdom = vdom;
    // placeholder.parentNode.removeChild(placeholder);
  }
  get vdom() {
    return this.render().vdom;
  }
  appendChild(vchild) {
    this.children.push(vchild);
  }
  setState(state, fn = () => {}) {
    let merge = (oldState, newState) => {
      for (let key in newState) {
        if (typeof newState[key] === "object" && newState[key] !== null) {
          if (typeof oldState[key] !== "object") {
            if (Array.isArray(newState[key])) {
              oldState[key] = [];
            } else {
              oldState[key] = {};
            }
          }
          merge(oldState[key], newState[key]);
        } else {
          oldState[key] = newState[key];
        }
      }
    };
    if (!this.state && state) {
      this.state = {};
    }
    merge(this.state, state);
    this.update();
  }
}

export let ToyReact = {
  createElement(componentName, attributes, ...children) {
    let element;
    if (typeof componentName === "string") {
      element = new ElementWrap(componentName);
    } else {
      element = new componentName();
    }
    // const element = document.createElement(componentName)

    for (const name in attributes) {
      element.setAttribute(name, attributes[name]);
    }
    let insertChildren = (children) => {
      for (let child of children) {
        if (typeof child === "object" && child instanceof Array) {
          insertChildren(child);
        } else {
          if (child === null || child === void 0) {
            child = "";
          }
          if (
            !(child instanceof Component) &&
            !(child instanceof ElementWrap) &&
            !(child instanceof TextWrap)
          ) {
            child = String(child);
          }
          if (typeof child === "string") {
            child = new TextWrap(child);
          }
          element.appendChild(child);
        }
      }
    };
    insertChildren(children);
    // debugger;
    return element;
  },
  render(vdom, element) {
    let range = document.createRange();
    if (element.children.length) {
      range.setStartAfter(element.lastChild);
      range.setEndAfter(element.lastChild);
    } else {
      range.setStart(element, 0);
      range.setEnd(element, 0);
    }
    vdom.mountTo(range);
  },
};
