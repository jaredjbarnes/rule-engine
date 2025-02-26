import { Node, Pattern } from "clarity-pattern-parser";
import { Variable } from "./variable.ts";

export const infixOperationNodeNames = {
    "assignment-expression": true,
    "mul-div-mod-expression": true,
    "add-sub-expression": true,
    "comparison-expression": true,
    "and-expression": true,
    "or-expression": true,
    "logical-comparison-expression": true,
    "logical-and-expression": true,
    "logical-or-expression": true,
};

export const prefixOperationNodeNames = {
    "not-expression": true,
    "plus-expression": true,
    "minus-expression": true
};

export class RulesEngine {
    private _rulesParser: Pattern;
    private _rulesAst: Node | null;
    private _dataContext: any | null;
    private _services: Record<string, (arg: any) => void>;

    get dataContext() {
        if (this._dataContext == null) {
            throw new Error("No data context.");
        }

        return this._dataContext;
    }

    get rules() {
        if (this._rulesAst == null) {
            throw new Error("No rules.");
        }

        return this._rulesAst;
    }

    constructor(rulesParser: Pattern, services: Record<string, (arg: any) => void> = {}) {
        this._rulesParser = rulesParser;
        this._rulesAst = null;
        this._dataContext = null;
        this._services = services;
    }

    async execute<T>(rules: string, dataContext: T) {
        const result = this._rulesParser.exec(rules);

        if (result.ast == null) {
            throw new Error("Invalid Rules");
        }

        this._rulesAst = result.ast;
        this._dataContext = dataContext;
        this._cleanAst(this._rulesAst);

        const ruleNodes = this.rules.findAll(n => n.name === "rule");

        for (const rule of ruleNodes) {
            await this._executeRule(rule);
        }

        return this._dataContext;
    }

    private async _executeRule(rule: Node) {
        const shouldRun = await this._shouldRun(rule);

        if (shouldRun) {
            await this._processBody(rule);
        }
    }

    private _cleanAst(ast: Node) {
        ast.findAll(n => n.name.includes("space")).forEach(n => n.remove());
    }

    private async _shouldRun(rule: Node) {
        const whenBody = rule.find(n => n.name === "when-statement");

        if (whenBody == null) {
            return true;
        }

        const result = await this._walkUp(whenBody, (n: Node, variables: Variable[]) => {
            return this._processNode(n, variables);
        });

        return result == null ? false : result.value;
    }

    private async _processNode(n: Node, variables: Variable[]): Promise<Variable> {
        if (n.name === "variable-reference") {
            return new Variable(this.dataContext, n.value);
        } else if (n.name === "now-literal") {
            return new Variable(new Date(), null);
        } else if (n.name === "date-literal") {
            return new Variable(new Date(n.value), null);
        } else if (n.name.includes("literal")) {
            return new Variable(JSON.parse(n.value), null);
        } else if (n.name === "refinement-expression") {
            const value = variables[1].value;
            if (variables[0] == null) {
                throw new Error("Left Variable is null.");
            }

            return variables[0].accessProperty(value);
        } else if (n.name === "dot-refinement" || n.name === "bracket-refinement") {
            return variables[1];
        } else if (n.name === "property") {
            return new Variable(n.value, null);
        } else if (infixOperationNodeNames[n.name] != null) {
            const operator = n.children[1].value;
            const leftVariable = variables[0];
            const rightVariable = variables[2];

            if (leftVariable == null || rightVariable == null) {
                throw new Error("Left and Right variables cannot be null.");
            }

            if (leftVariable[operator] == null) {
                throw new Error(`Unsupported infix operator: ${operator}`);
            }

            return leftVariable[operator](rightVariable);

        } else if (prefixOperationNodeNames[n.name]) {
            const operator = n.children[0].value;
            const variable = variables[1];

            if (variable == null) {
                throw new Error("Variable is null.");
            }

            if (variable[operator] == null) {
                throw new Error(`Unsupported prefix operator: ${operator}`);
            }

            return variable[operator]();
        } else if (n.name === "service-invocation") {
            const serviceNameNode = n.find(n => n.name === "service-name");
            const serviceName = String(serviceNameNode?.value);

            if (this._services[serviceName] != null) {
                this._services[serviceName](variables);
            }

            return new Variable(undefined, null);
        } else if (n.name === "group-expression") {
            return variables[1];
        } else if (n.name === "when-statement") {
            return variables[1];
        } else {
            return new Variable(variables[0], null);
        }

    }

    private async _processBody(rule: Node) {
        const thenBody = rule.find(n => n.name === "then-body");

        if (thenBody == null) {
            return;
        }

        for (const expression of thenBody.children) {
            await this._walkUp(expression, (n: Node, variables: Variable[]) => {
                return this._processNode(n, variables);
            });
        }
    }

    private async _walkUp(node: Node, callback: (node: Node, variables: Variable[]) => Promise<Variable>): Promise<Variable> {
        const args: Variable[] = [];

        for (const child of node.children) {
            const value = await this._walkUp(child, callback);
            args.push(value);
        }

        return callback(node, args);
    }

}
