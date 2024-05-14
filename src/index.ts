import * as console from "node:console";
import {translateToWorkflowInput} from "./presentation/lib/translate-input-string";
import {DeriveSumPriceWorkflow} from "./workflow/derive-sum-price-workflow";

export const main = (inputString: string) => {
  const input = translateToWorkflowInput(inputString);
  return new DeriveSumPriceWorkflow().deriveSumPrice(input);
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
