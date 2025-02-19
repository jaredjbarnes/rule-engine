import { DataContext } from "./data_context.ts";
import { Node } from "clarity-pattern-parser";
import { Operand } from "./operand.ts";
import { ruleParser as rulesParser } from "./rule_parser.ts";

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

export class RulesEngine<T> {
    private _rulesAst: Node | null;
    private _dataContext: any | null;
    private _leftOperand: Operand;
    private _rightOperand: Operand;
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

    constructor(services: Record<string, (arg: any) => void>) {
        this._rulesAst = null;
        this._dataContext = null;
        this._services = services;
        this._leftOperand = new Operand(undefined);
        this._rightOperand = new Operand(undefined);
    }

    execute(rules: string, dataContext: DataContext<T>,) {
        const result = rulesParser.exec(rules);


        if (result.ast == null) {
            throw new Error("Invalid Rule");
        }

        this._rulesAst = result.ast;
        this._dataContext = dataContext;
        this._cleanAst(this._rulesAst);
        this._leftOperand = new Operand(undefined);
        this._rightOperand = new Operand(undefined);

        if (this._shouldRun()) {
            this._processBody();
        }

        return this._dataContext;
    }

    private _cleanAst(ast: Node) {
        ast.findAll(n => n.name.includes("space")).forEach(n => n.remove());
    }

    private _shouldRun() {
        this._leftOperand = new Operand(undefined);
        this._rightOperand = new Operand(undefined);

        const whenBody = this.rules.find(n => n.name === "when-body");

        if (whenBody == null) {
            return true;
        }

        whenBody.walkUp(n => {
            this._processNode(n);
            return this._leftOperand.type === "boolean" ? this._leftOperand.value : false;
        });

        return false;
    }

    private _processNode(n: Node) {
        if (n.name === "variable-reference" || n.name.includes("literal")) {
            if (this._leftOperand.type === "undefined") {
                this._leftOperand = new Operand(this.dataContext[n.value]);
                this._rightOperand = new Operand(undefined);
            } else {
                this._rightOperand = new Operand(this._dataContext[n.value]);
            }
        } else if (n.name === "refinement-expression") {
            if (this._rightOperand.type === "undefined") {
                this._leftOperand.accessProperty(n.value);
            } else {
                this._rightOperand.accessProperty(n.value);
            }
        } else if (infixOperationNodeNames[n.name] != null) {

            const operator = n.children[1].value;
            this._leftOperand[operator] && this._leftOperand[operator](this._rightOperand);

        } else if (prefixOperationNodeNames[n.name]) {
            const operator = n.children[0].value;

            if (this._rightOperand.type === "undefined") {
                this._leftOperand = this._leftOperand[operator] && this._leftOperand[operator]();
            } else {
                this._rightOperand = this._rightOperand[operator] && this._rightOperand[operator]();
            }

        } else if (n.name === "service-invocation") {
            const serviceNameNode = n.find(n => n.name === "service-name");
            const serviceName = String(serviceNameNode?.value);

            if (this._services[serviceName] != null) {
                this._services[serviceName](this._leftOperand);
            }
        }
    }

    private _processBody() {
        const thenBody = this.rules.find(n => n.name === "then-body");

        if (thenBody == null) {
            return;
        }

        thenBody.children.forEach((expression) => {
            this._leftOperand = new Operand(undefined);
            this._rightOperand = new Operand(undefined);

            expression.walkUp(n => {
                this._processNode(n);
            });
        });

    }

}
