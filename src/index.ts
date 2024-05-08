import * as console from "node:console";

export const main = (input: string) => 1;



process.stdin.resume();
process.stdin.setEncoding('utf-8');

const reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', (line) => {
  console.log(main(line));
});
