import { patterns } from "clarity-pattern-parser";

const { rules } = patterns`
    rule-keyword = "RULE"
    salience-keyword = "salience"
    when-keyword = "WHEN"
    then-keyword = "THEN"

    url = /https:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s\]]*)?/
    string-literal = /"(?:\\.|[^"\\])*"/
    null-literal = "null"
    line-spaces = /[^\S\r\n]+/
    spaces = /\s+/
    name = /[a-zA-Z_$][a-zA-Z_$0-9]*/
    integer = /[1-9][0-9]*|0/
    variable-reference = name
    number-literal = /[+-]?\d+(\.\d+)?([eE][+-]?\d+)?/
    true-literal = "true"
    false-literal = "false"
    bool-literal = true-literal | false-literal

    object-property-name = string-literal
    value = literal | expression
    object-property = object-property-name + spaces? + ":" + spaces? + value
    object-properties = (object-property, /\s*,\s*/)+
    object-literal = "{" + spaces? + object-properties? + spaces? +"}" 

    array-items = (value, /\s*,\s*/)+
    array-literal = "[" + spaces? + array-items? + spaces? + "]"

    literal = object-literal | array-literal | string-literal | bool-literal | null-literal | number-literal

    not-expression = "!" + spaces? + expression
    plus-expression = "+" + spaces? + expression
    minus-expression = "-" + expression

    assignment-operator = "="

    comparison-operator = "<=" | "<" | ">=" | ">" | "==" | "!="
    comparison-expression = expression + spaces? + comparison-operator + spaces? + expression

    property = name
    dot-refinement = "." + property
    bracket-refinement = "[" +spaces? + expression + spaces? + "]"

    refinement = dot-refinement | bracket-refinement
    refinement-expression = expression + refinement

    argument-delimiter = /\s*,\s*/
    args = (expression, argument-delimiter trim)+
    invocation = "(" + spaces? + args? + spaces? + ")"

    service-invocation = "[" + spaces? + url + spaces? + "](" + spaces? + object-literal? + spaces? + ")" 
    assignment-expression = expression + spaces? + assignment-operator + spaces? + expression

    mul-div-mod-operator = "*" | "/" | "%"
    add-sub-operator = "+" | "-"
    modulo-operator = "%"
    or-operator = "||" 
    and-operator = "&&" 

    mul-div-mod-expression = expression + spaces? + mul-div-mod-operator + spaces? + expression
    add-sub-expression = expression + spaces? + add-sub-operator + spaces? + expression
    and-expression = expression + spaces? + and-operator + spaces? + expression
    or-expression = expression + spaces? + or-operator + spaces? + expression
    group-expression = "(" + spaces? + expression + spaces? + ")"

    logical-and-expression = logical-expression + spaces? + and-operator + spaces? + logical-expression
    logical-or-expression = logical-expression + spaces? + or-operator + spaces? + logical-expression
    logical-comparison-expression = logical-expression + spaces? + comparison-operator + spaces? + logical-expression

    expression = group-expression | not-expression | plus-expression | minus-expression | service-invocation | refinement-expression |  mul-div-mod-expression | add-sub-expression | and-expression | or-expression | comparison-expression | assignment-expression | variable-reference | literal
    logical-expression = logical-comparison-expression | logical-and-expression | logical-or-expression | expression

    action-name = name

    rule-name = name
    rule-header = rule-keyword + line-spaces + rule-name + line-spaces?
    salience-statement = salience-keyword + line-spaces + integer + line-spaces?
    then-body = (expression, spaces trim)+
    when-body = expression
    when-statement = when-keyword + spaces? + when-body 
    then-statement = then-keyword + spaces? + then-body

    rule-body = "{" + spaces? + when-statement + spaces + then-statement + spaces? + "}"
    rule = rule-header + spaces? + salience-statement? + spaces? + rule-body + line-spaces?

    rules = (rule, spaces)+
`;

export const ruleParser = rules;