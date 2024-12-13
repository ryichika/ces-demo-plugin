import {registerOperator, Operator, OperatorConfig} from "@fiftyone/operators";
// import * as state from "./state"
import {useRecoilState} from "recoil";

export class ShowMessageOperator extends Operator {
  get config() {
    return new OperatorConfig({
      name: 'show_message',
      label: 'Show Message',
    })
  }

  useHooks() {    
    return {
      addMessage: (message: string) => {
        alert(message)
      },      
    }
  }

  async execute(ctx: any) {
    ctx.hooks.addMessage("Hello World")
  }
}

