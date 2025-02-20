import { readFile } from 'fs/promises';

export async function resolveNodeImport(path: string, originPath: string | null) {
    const origin = originPath == null ? import.meta.url : originPath;
    const url = new URL(path, origin);
    const pathname = url.pathname;

    try {
        const expression = await readFile(pathname, "utf-8");
        return { expression, resource: pathname };
    } catch {
        throw new Error(`File not found: ${path}`);
    }
}