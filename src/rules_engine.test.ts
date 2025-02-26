import { expect, test, describe } from 'vitest';
import { RulesEngine } from './rules_engine.ts';
import { Grammar } from 'clarity-pattern-parser';
import { resolveNodeImport } from './resolve_node_import.ts';
import { readFile } from 'fs/promises';

function resolvePath(path: string) {
    const origin = import.meta.url;
    const url = new URL(path, origin);
    const pathname = url.pathname;

    return pathname;
}

describe("Rules Engine", () => {
    test("Match and Act", async () => {
        const rules = await readFile(resolvePath("./test_rules/assignment.rule"), "utf-8");
        const patterns = await Grammar.import("./rules.cpat", {
            resolveImport: resolveNodeImport
        });

        const rulesEngine = new RulesEngine(patterns["rules-grammar"], {});
        const result = await rulesEngine.execute(rules, {
            person: {
                firstName: "John",
                lastName: "Smith"
            }
        });

        expect(result.person.lastName).toBe("Doe");
    });

    test("Match and Multiple Acts", async () => {
        const rules = await readFile(resolvePath("./test_rules/multiple_assignment.rule"), "utf-8");
        const patterns = await Grammar.import("./rules.cpat", {
            resolveImport: resolveNodeImport
        });

        const rulesEngine = new RulesEngine(patterns["rules-grammar"], {});
        const result = await rulesEngine.execute(rules, {
            person: {
                firstName: "John",
                lastName: "Smith"
            }
        });

        expect(result.person.lastName).toBe("Doe");
        expect(result.person.firstName).toBe("Jane");
    });

    test("Complex Conditions", async () => {
        const rules = await readFile(resolvePath("./test_rules/complex_condition.rule"), "utf-8");
        const patterns = await Grammar.import("./rules.cpat", {
            resolveImport: resolveNodeImport
        });

        const rulesEngine = new RulesEngine(patterns["rules-grammar"], {});
        const result = await rulesEngine.execute(rules, {
            person: {
                firstName: "John",
                lastName: "Smith",
                age: 10
            }
        });

        expect(result.person.lastName).toBe("Doe");
        expect(result.person.firstName).toBe("Aydri");
    });

    test("Multiple Rules", async () => {
        const rules = await readFile(resolvePath("./test_rules/multiple_rules.rule"), "utf-8");
        const patterns = await Grammar.import("./rules.cpat", {
            resolveImport: resolveNodeImport
        });

        const rulesEngine = new RulesEngine(patterns["rules-grammar"], {});
        const result = await rulesEngine.execute(rules, {
            person: {
                firstName: "John",
                lastName: "Smith",
                age: 71,
                height: 76,
                isSeniorCitizen: false,
                isTall: false
            },
            discount: 0
        });

        expect(result.person.isSeniorCitizen).toBe(true);
        expect(result.person.isTall).toBe(true);
        expect(result.discount).toBe(0.2);
    });
});