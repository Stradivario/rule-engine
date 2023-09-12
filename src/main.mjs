import { VM } from "vm2";

const vm = new VM({
  sandbox: {
    console: {
      log: console.log,
    },
  },
});

const multiplicationFormula = {
  name: "Multiplication",
  value: "*",
};

const divisionFormula = {
  name: "Division",
  value: "/",
};

const additionFormula = {
  name: "Addition",
  value: "+",
};

const subtractionFormula = {
  name: "Substraction",
  value: "-",
};

const circumferenceFormula = {
  name: "Circumference of Circle",
  value: `
    function circumferenceCircle(value) {
      return Math.PI ${multiplicationFormula.value} value
    }
  `,
};

function calculateCircumferenceOfCircle(diameter) {
  return vm.run(
    `(async () => { 
      ${circumferenceFormula.value}
      return circumferenceCircle(${diameter})
     })()`
  );
}

function division(a, b) {
  return vm.run(
    `(async () => { return ${a} ${divisionFormula.value} ${b} })()`
  );
}

function substraction(a, b) {
  return vm.run(
    `(async () => { return ${a} ${subtractionFormula.value} ${b} })()`
  );
}

function addition(a, b) {
  return vm.run(
    `(async () => { return ${a} ${additionFormula.value} ${b} })()`
  );
}

function multiplication(a, b) {
  return vm.run(
    `(async () => { return ${a} ${multiplicationFormula.value} ${b} })()`
  );
}

calculateCircumferenceOfCircle(10).then(console.log);
division(1, 2).then(console.log);
substraction(1, 2).then(console.log);
addition(1, 2).then(console.log);
multiplication(1, 2).then(console.log);
