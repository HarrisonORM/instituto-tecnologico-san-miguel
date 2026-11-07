import sharp from "sharp";
import process from "node:process";
import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir("public/media", { recursive: true });
for (const name of ["software", "networks", "community"]) {
  const source = `work/photo-originals/${name}.png`;
  const prompt = (await readFile(`work/photo-originals/${name}.prompt.txt`, "utf8")).trim();
  const target = `public/media/${name}.webp`;
  await sharp(source).webp({ quality: 82 }).toFile(target);
  await writeFile(`${target}.json`, JSON.stringify({ origin: "Generated using integrated image_gen", illustrative: true, fictionalInstitution: true, prompt }, null, 2));
  const metadata = await sharp(target).metadata();
  process.stdout.write(`${target}: ${metadata.width}x${metadata.height}\n`);
}
