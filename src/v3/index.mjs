import ivm from 'isolated-vm';

class RuleEngineUtil {

  flows = [{
    id: 1,
    name: 'Calculate digital twin',
    viewValueName: 'myCalculation',
    formulasSequence: [1, 2, 3]
  },
  {
    id: 2,
    name: 'Calculate Area',
    viewValueName: 'area',
    formulasSequence: [1]
  },
  {
    id: 3,
    name: 'Calculate Perimeter',
    viewValueName: 'perimeter',
    formulasSequence: [2]
  }];

  formulas = [{
    id: 1,
    name: 'Area',
    value: `function calculateArea(value){
      return Math.PI * Math.pow(value, 2)
    }`,
    functionName: 'calculateArea'
  },
  {
    id: 2,
    name: 'Perimeter',
    value: `
      function calculatePerimeter(value) {
        return 2 * Math.PI * value;
      }
    `,
    functionName: 'calculatePerimeter'
  },
  {
    id: 3,
    name: 'Multiply',
    value: `
      function multiply(value) {
        return value * 2;
      }
    `,
    functionName: 'multiply'
  }];

  async executeFormula(code) {
    const vm = new ivm.Isolate({ memoryLimit: 8 });
    const script = await vm.compileScript(code);
    const context = await vm.createContext();
    return script.run(context, { promise: true });
  }

  async runFlow(flowId, value) {
    const flow = this.flows.find(v => v.id === flowId);
    let calculatedValue;
    for (const formulaId of flow.formulasSequence) {

      const formula = this.formulas.find(v => v.id === formulaId);

      calculatedValue = await this.genericEvaluateTemplate(calculatedValue || value, formula);
    }
    return {
      [flow.viewValueName]: calculatedValue
    };
  }

  genericEvaluateTemplate(value, formula) {
    return this.executeFormula(`(async () => { 
      ${formula.value}
      return ${formula.functionName}(${value});
     })()`);
  }


  addFormula(formula) {
    this.formulas.push(formula);
  }

  removeFormula(formula) {
    this.formulas = this.formulas.filter(f => f.id !== formula.id);
  }

  addFlow(flow) {
    this.flows = [...this.flows, flow]
  }

  removeFlow(flow) {
    this.flows = this.flows.filter(f => f.id !== flow.id)
  }

}

const ruleEngineUtil = new RuleEngineUtil();

async function basicRequest() {
  const requestBody = {
    flows: [1, 2, 3],
    shape: "circle",
    side: 5,
  };

  let responseBody = {
    ...requestBody,
    metadata: {}
  }

  for (const flow of requestBody.flows) {
    responseBody = {
      ...responseBody,
      metadata: {
        ...responseBody.metadata,
        ...await ruleEngineUtil.runFlow(flow, requestBody.side)
      }
    }
  }

  return responseBody;
}

async function advancedRequest() {
  const requestBody = {
    flows: [4],
    shape: "circle",
    side: 5,
  };

  ruleEngineUtil.addFormula({
    id: 4,
    name: 'Divide by Two',
    value: `
      function divide(value) {
        return value / 2;
      }
    `,
    functionName: 'divide'
  });

  ruleEngineUtil.addFlow({
    id: 4,
    name: 'Divide Flow',
    viewValueName: 'divided',
    formulasSequence: [4]
  });

  let responseBody = {
    ...requestBody,
    metadata: {}
  }

  for (const flow of requestBody.flows) {
    responseBody = {
      ...responseBody,
      metadata: {
        ...responseBody.metadata,
        ...await ruleEngineUtil.runFlow(flow, requestBody.side)
      }
    }
  }
  return responseBody;
}

basicRequest().then(console.log)

// advancedRequest().then(console.log)