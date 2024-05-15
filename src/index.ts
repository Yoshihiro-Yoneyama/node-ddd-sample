import * as console from "node:console";
import {translateToWorkflowInput} from "./presentation/lib/translate-input-string";
import {DeriveTotalPriceWorkflow} from "./workflow/derive-total-price-workflow";

export const main = (inputString: string) => {
  try {
    const input = translateToWorkflowInput(inputString);
    return DeriveTotalPriceWorkflow.deriveTotalPrice(input);
  } catch (e) {
    return e.message;
  }
};

process.stdin.resume();
process.stdin.setEncoding('utf-8');

const reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

reader.on('line', (line) => {
  console.log(main(line));
});
