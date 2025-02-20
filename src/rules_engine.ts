import { Node, Pattern } from "clarity-pattern-parser";
import { Operand } from "./operand.ts";

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

    execute<T>(rules: string, dataContext: T) {
        const result = this._rulesParser.exec(rules);


        if (result.ast == null) {
            throw new Error("Invalid Rules");
        }

        this._rulesAst = result.ast;
        this._dataContext = dataContext;
        this._cleanAst(this._rulesAst);

        if (this._shouldRun()) {
            this._processBody();
        }

        return this._dataContext;
    }

    private _cleanAst(ast: Node) {
        ast.findAll(n => n.name.includes("space")).forEach(n => n.remove());
    }

    private _shouldRun() {
        const whenBody = this.rules.find(n => n.name === "when-statement");

        if (whenBody == null) {
            return true;
        }

        const result = this._walkUp(whenBody, (n: Node, operands: Operand[]) => {
            return this._processNode(n, operands);
        });


        return result == null ? false : result.value;
    }

    private _processNode(n: Node, operands: Operand[]): Operand {
        if (n.name === "variable-reference") {
            return new Operand(this.dataContext, n.value);
        } else if (n.name.includes("literal")) {
            return new Operand(JSON.parse(n.value), null);
        } else if (n.name === "refinement-expression") {
            const value = operands[1].value;
            if (operands[0] == null) {
                throw new Error("Left Operand is null.");
            }

            return operands[0].accessProperty(value);
        } else if (n.name === "dot-refinement" || n.name === "bracket-refinement") {
            return operands[1];
        } else if (n.name === "property") {
            return new Operand(n.value, null);
        } else if (infixOperationNodeNames[n.name] != null) {
            const operator = n.children[1].value;
            const leftOperand = operands[0];
            const rightOperand = operands[2];

            if (leftOperand == null || rightOperand == null) {
                throw new Error("Left and Right Operands cannot be null.");
            }

            if (leftOperand[operator] == null) {
                throw new Error(`Unsupported infix operator: ${operator}`);
            }

            return leftOperand[operator](rightOperand);

        } else if (prefixOperationNodeNames[n.name]) {
            const operator = n.children[0].value;
            const operand = operands[1];

            if (operand == null) {
                throw new Error("Operand is null.");
            }

            if (operand[operator] == null) {
                throw new Error(`Unsupported prefix operator: ${operator}`);
            }

            return operand[operator]();
        } else if (n.name === "service-invocation") {
            const serviceNameNode = n.find(n => n.name === "service-name");
            const serviceName = String(serviceNameNode?.value);

            if (this._services[serviceName] != null) {
                this._services[serviceName](operands);
            }

            return new Operand(undefined, null);
        } else if (n.name === "group-expression") {
            return operands[1];
        } else if (n.name === "when-statement"){
            return operands[1];
        } else {
            return new Operand(operands[0], null);
        }



    }

    private _processBody() {
        const thenBody = this.rules.find(n => n.name === "then-body");

        if (thenBody == null) {
            return;
        }

        thenBody.children.forEach((expression) => {
            this._walkUp(expression, (n: Node, operands: Operand[]) => {
                return this._processNode(n, operands);
            });
        });

    }

    private _walkUp(node: Node, callback: (node: Node, operands: Operand[]) => Operand): Operand {
        const args: Operand[] = [];

        for (const child of node.children) {
            args.push(this._walkUp(child, callback));
        }

        return callback(node, args);
    }

}
