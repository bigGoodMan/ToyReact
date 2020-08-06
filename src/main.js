// require("./lib.js");
// console.log("main")
import {ToyReact, Component} from "./ToyReact";
class MyComponent extends Component{
  render(){
    const children = this.children;
  return <div>cool{children}</div>
  }
}
const b = <div name="go" id="my">
  say:
  <span class="span1">hello</span>
  <span>word</span>
  <span>{true}</span>
</div>
let a = <MyComponent name="a">{b}</MyComponent>
ToyReact.render(a, document.body)