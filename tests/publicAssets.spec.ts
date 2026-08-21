import { describe, test, expect } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Every asset this project loads is referenced by a string, not by an
 * import, so nothing in the type system knows whether the file on the
 * other end exists. Renaming a file or a directory therefore breaks the
 * game at runtime while leaving the build perfectly green.
 *
 * These tests close that gap from both ends: every reference must point
 * at a real file, and every file must be referenced by something.
 */

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const publicDir = resolve(root, "public");

/** Absolute-rooted src/href attributes in index.html. */
function indexHtmlReferences(): string[] {
  const html = readFileSync(resolve(root, "index.html"), "utf8");
  return [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)]
    .map((m) => m[1])
    // Vite resolves the entry module out of src/, not out of public/.
    .filter((ref) => !ref.startsWith("/src/"));
}

/** Paths built at runtime as `${import.meta.env.BASE_URL}<path>`. */
function runtimeReferences(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".ts")) {
        const source = readFileSync(path, "utf8");
        for (const match of source.matchAll(/BASE_URL\}([\w./-]+)/g)) {
          found.push("/" + match[1]);
        }
      }
    }
  };
  walk(resolve(root, "src"));
  return found;
}

describe("public assets", () => {
  test("every reference in index.html resolves to a file", () => {
    const references = indexHtmlReferences();

    // A guard on the guard: if the regex ever stops matching, this test
    // would pass by finding nothing at all.
    expect(references.length).toBeGreaterThan(15);

    for (const ref of references) {
      expect(existsSync(join(publicDir, ref)), ref).toBe(true);
    }
  });

  test("every path built from BASE_URL resolves to a file", () => {
    // The audio manifest supplies its own paths and is checked in
    // layoutIntegrity.spec.ts; this covers the hardcoded ones.
    const references = runtimeReferences();

    expect(references.length).toBeGreaterThan(2);

    for (const ref of references) {
      expect(existsSync(join(publicDir, ref)), ref).toBe(true);
    }
  });

  test("no image in public/images is left unreferenced", () => {
    // Carried over from the original's manual, where it was a 33x29
    // inline icon in the terminal section. This port's dossier uses the
    // full terminal screenshot instead and never places it. Kept in
    // case that section grows an illustration; listed here so the check
    // below still catches anything that goes stale from now on.
    const knownUnused = ["images/dossier/terminal.png"];

    const html = readFileSync(resolve(root, "index.html"), "utf8");
    const sources = readdirSync(resolve(root, "src"), { recursive: true })
      .filter((name) => String(name).endsWith(".ts"))
      .map((name) => readFileSync(resolve(root, "src", String(name)), "utf8"))
      .join("\n");
    const haystack = html + sources;

    const images: string[] = [];
    const walk = (dir: string, prefix: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) walk(join(dir, entry.name), `${prefix}${entry.name}/`);
        else images.push(prefix + entry.name);
      }
    };
    walk(join(publicDir, "images"), "images/");

    const orphans = images.filter(
      (image) => !haystack.includes(image) && !knownUnused.includes(image),
    );
    expect(orphans, "unreferenced images").toEqual([]);

    // If one of the allowed orphans gets used, drop it from the list.
    for (const allowed of knownUnused) {
      expect(haystack.includes(allowed), `${allowed} is referenced now`).toBe(false);
    }
  });
});
