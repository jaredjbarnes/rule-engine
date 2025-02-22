export class Variable {
    private _type: "string" | "number" | "boolean" | "null" | "date" | "array" | "object" | "undefined";
    private _context: any;
    private _accessor: string | null;

    get type() {
        return this._type;
    }

    get value() {
        if (this._accessor == null) {
            return this._context;
        }

        return this._context[this._accessor];
    }

    constructor(context: any, accessor: string | null) {
        this._accessor = accessor;
        this._context = context;

        const value = accessor == null ? context : context[accessor];

        if (typeof value === "string") {
            this._type = "string";
        } else if (typeof value === "number") {
            this._type = "number";
        } else if (typeof value === "boolean") {
            this._type = "boolean";
        } else if (typeof value === "undefined") {
            this._type = "undefined";
        } else if (value == null) {
            this._type = "null";
        } else if (context instanceof Date) {

            if (isNaN(context.getTime())) {
                this._type = "undefined";
                this._context = undefined;
            } else {
                this._type = "date";
            }

        } else if (Array.isArray(value)) {
            this._type = "array";
        } else if (typeof value === "object") {
            this._type = "object";
        } else {
            throw new Error("Unexpected value.");
        }

    }

    accessProperty(accessor: string) {
        if (this._type === "object") {
            if (this.value[accessor] != null) {
                return new Variable(this.value, accessor);
            } else {
                throw new Error(`Cannot find property with name: ${accessor}.`);
            }
        } else if (this._type === "array") {
            if (this.value[accessor] != null) {
                return new Variable(this.value, accessor);
            } else {
                throw new Error(`Cannot find value at index: ${accessor}.`);
            }
        } else {
            throw new Error(`Cannot access properties on ${this._type} types.`);
        }
    }

    accessIndex(index: number) {
        return this.accessProperty(String(index));
    }

    "="(operand: Variable) {
        if (this._accessor != null) {
            this._context[this._accessor] = operand.value;
        }
    }

    "+"(operand: Variable) {
        if (this._type === "string" && (operand.type === "number" || operand.type === "string")) {
            return new Variable(this.value + operand.value, null);
        } else if (this._type === "number" && operand.type === "number") {
            return new Variable(this.value + operand.value, null);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "-"(operand: Variable) {
        if (this._type === "number" && operand.type === "number") {
            return new Variable(this.value - operand.value, null);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "*"(operand: Variable) {
        if (this._type === "number" && operand.type === "number") {
            return new Variable(this.value * operand.value, null);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "/"(operand: Variable) {
        if (this._type === "number" && operand.type === "number") {
            return new Variable(this.value / operand.value, null);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "%"(operand: Variable) {
        if (this._type === "number" && operand.type === "number") {
            return new Variable(this.value % operand.value, null);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "=="(operand: Variable) {
        if (this._type === "date" || operand.type === "date") {
            return new Variable(this.value.getTime() === operand.value.getTime(), null);
        } else if (this._type === operand.type) {
            return new Variable(this.value === operand.value, null);
        } else {
            throw new Error(`Cannot compare different types.`);
        }
    }

    "!="(operand: Variable) {
        if (this._type === "date" || operand.type === "date") {
            return new Variable(this.value.getTime() === operand.value.getTime(), null);
        } else if (this._type !== operand.type) {
            return new Variable(this.value !== operand.value, null);
        } else {
            throw new Error(`Cannot compare different types.`);
        }
    }

    ">="(operand: Variable) {
        if (this._type === "date" || operand.type === "date") {
            return new Variable(this.value.getTime() >= operand.value.getTime(), null);
        } else if (this._type === operand.type && this._type === "number") {
            return new Variable(this.value >= operand.value, null);
        } else {
            throw new Error(`Cannot compare if operand is greater than or equal to on non numeric values.`);
        }
    }

    ">"(operand: Variable) {
        if (this._type === "date" || operand.type === "date") {
            return new Variable(this.value.getTime() > operand.value.getTime(), null);
        } else if (this._type === operand.type && this._type === "number") {
            return new Variable(this.value > operand.value, null);
        } else {
            throw new Error(`Cannot compare if operand is greater than to on non numeric values.`);
        }
    }

    "<="(operand: Variable) {
        if (this._type === "date" || operand.type === "date") {
            return new Variable(this.value.getTime() <= operand.value.getTime(), null);
        } else if (this._type === operand.type && this._type === "number") {
            return new Variable(this.value <= operand.value, null);
        } else {
            throw new Error(`Cannot compare if operand is less than or equal to on non numeric values.`);
        }
    }

    "<"(operand: Variable) {
        if (this._type === "date" || operand.type === "date") {
            return new Variable(this.value.getTime() < operand.value.getTime(), null);
        } else if (this._type === operand.type && this._type === "number") {
            return new Variable(this.value < operand.value, null);
        } else {
            throw new Error(`Cannot compare if operand is less than on non numeric values.`);
        }
    }

    "&&"(operand: Variable) {
        if (this._type === "boolean" && operand.type === "boolean") {
            return new Variable(this.value && operand.value, null);
        } else {
            throw new Error(`Can only logically reduce boolean values.`);
        }
    }

    "||"(operand: Variable) {
        if (this._type === "boolean" && operand.type === "boolean") {
            return new Variable(this.value || operand.value, null);
        } else {
            throw new Error(`Can only logically reduce boolean values.`);
        }
    }

    "!"() {
        if (this._type === "boolean") {
            return new Variable(!this.value, null);
        } else {
            throw new Error(`Can only negate boolean values.`);
        }
    }
}