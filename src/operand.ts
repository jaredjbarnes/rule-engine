export class Operand {
    private _type: "string" | "number" | "boolean" | "null" | "array" | "object" | "undefined";
    private _value: any;

    get type() {
        return this._type;
    }

    get value() {
        return this._value;
    }

    constructor(value: any) {
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
        } else if (Array.isArray(value)) {
            this._type = "array";
        } else if (typeof value === "object") {
            this._type = "object";
        } else {
            throw new Error("Unexpected value.");
        }

        this._value = value;
    }

    accessProperty(key: string) {
        if (this._type === "object") {
            if (this._value[key] != null) {
                return new Operand(this._value[key]);
            } else {
                throw new Error(`Cannot find property with name: ${key}.`);
            }
        } else if (this._type === "array") {
            if (this._value[key] != null) {
                return new Operand(this._value[key]);
            } else {
                throw new Error(`Cannot find value at index: ${key}.`);
            }
        } else {
            throw new Error(`Cannot access properties on ${this._type} types.`);
        }
    }

    accessIndex(index: number) {
        return this.accessProperty(String(index));
    }

    "+"(operand: Operand) {
        if (this._type === "string" && (operand.type === "number" || operand.type === "string")) {
            return new Operand(this._value + operand.value);
        } else if (this._type === "number" && operand.type === "number") {
            return new Operand(this._value + operand.value);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "-"(operand: Operand) {
        if (this._type === "number" && operand.type === "number") {
            return new Operand(this._value - operand.value);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "*"(operand: Operand) {
        if (this._type === "number" && operand.type === "number") {
            return new Operand(this._value * operand.value);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "/"(operand: Operand) {
        if (this._type === "number" && operand.type === "number") {
            return new Operand(this._value / operand.value);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "%"(operand: Operand) {
        if (this._type === "number" && operand.type === "number") {
            return new Operand(this._value % operand.value);
        } else {
            throw new Error(`Cannot add type ${this._type} with type ${operand.type}.`);
        }
    }

    "=="(operand: Operand) {
        if (this._type === operand.type) {
            return new Operand(this._value === operand.value);
        } else {
            throw new Error(`Cannot compare different types.`);
        }
    }

    "!="(operand: Operand) {
        if (this._type === operand.type) {
            return new Operand(this._value !== operand.value);
        } else {
            throw new Error(`Cannot compare different types.`);
        }
    }

    ">="(operand: Operand) {
        if (this._type === operand.type && this._type === "number") {
            return new Operand(this._value >= operand.value);
        } else {
            throw new Error(`Cannot compare if operand is greater than or equal to on non numeric values.`);
        }
    }

    ">"(operand: Operand) {
        if (this._type === operand.type && this._type === "number") {
            return new Operand(this._value > operand.value);
        } else {
            throw new Error(`Cannot compare if operand is greater than to on non numeric values.`);
        }
    }

    "<="(operand: Operand) {
        if (this._type === operand.type && this._type === "number") {
            return new Operand(this._value <= operand.value);
        } else {
            throw new Error(`Cannot compare if operand is less than or equal to on non numeric values.`);
        }
    }

    "<"(operand: Operand) {
        if (this._type === operand.type && this._type === "number") {
            return new Operand(this._value < operand.value);
        } else {
            throw new Error(`Cannot compare if operand is less than on non numeric values.`);
        }
    }

    "&&"(operand: Operand) {
        if (this._type === "boolean" && operand.type === "boolean") {
            return new Operand(this._value && operand.value);
        } else {
            throw new Error(`Can only logically reduce boolean values.`);
        }
    }

    "||"(operand: Operand) {
        if (this._type === "boolean" && operand.type === "boolean") {
            return new Operand(this._value || operand.value);
        } else {
            throw new Error(`Can only logically reduce boolean values.`);
        }
    }

    "!"() {
        if (this._type === "boolean") {
            return new Operand(!this._value);
        } else {
            throw new Error(`Can only negate boolean values.`);
        }
    }
}