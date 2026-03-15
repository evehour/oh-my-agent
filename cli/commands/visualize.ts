import { writeFileSync } from "node:fs";
import { extname } from "node:path";
import pc from "picocolors";
import { buildGraph, renderAscii, renderSvg } from "../lib/graph.js";

async function svgToPng(svg: string): Promise<Buffer | null> {
  try {
    const { Resvg } = await import("@resvg/resvg-js");
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1600 },
    });
    return Buffer.from(resvg.render().asPng());
  } catch {
    return null;
  }
}

const RASTER_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export async function visualize(options: {
  output?: string;
  json?: boolean;
}): Promise<void> {
  const graph = buildGraph(process.cwd());

  if (options.json) {
    console.log(JSON.stringify(graph, null, 2));
    return;
  }

  if (options.output) {
    const ext = extname(options.output).toLowerCase();
    const svg = renderSvg(graph);

    if (RASTER_EXTS.has(ext)) {
      const png = await svgToPng(svg);
      if (png) {
        writeFileSync(options.output, png);
        console.log(
          `${pc.green("✓")} Graph saved to ${pc.bold(options.output)}`,
        );
      } else {
        const fallback = options.output.replace(ext, ".svg");
        writeFileSync(fallback, svg, "utf-8");
        console.log(
          `${pc.yellow("!")} PNG conversion failed. Saved as ${pc.bold(fallback)}`,
        );
        console.log(pc.dim("  Run: bun add @resvg/resvg-js"));
      }
      return;
    }

    const outPath = ext === ".svg" ? options.output : `${options.output}.svg`;
    writeFileSync(outPath, svg, "utf-8");
    console.log(`${pc.green("✓")} Graph saved to ${pc.bold(outPath)}`);
    return;
  }

  console.log(renderAscii(graph));
}
