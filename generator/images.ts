import Spritesmith from 'spritesmith';
import type { SpritesmithResult } from 'spritesmith'
import { resolve } from 'path';
import { decodeBLP, getBLPImageData } from 'war3-model';
import { readFile, writeFile } from 'fs/promises';
import { PNG } from 'pngjs';
import { buffer } from 'node:stream/consumers';
import { PassThrough } from 'stream';
import Vinyl from 'vinyl';
// @ts-expect-error no typings
import { buffer2webpbuffer, grant_permission } from 'webp-converter';
import { chmodSync, existsSync, mkdirSync } from 'fs';
import { decodeImage, parseDDSHeader } from 'dds-ktx-parser';

const webpDir = resolve(process.cwd(), 'node_modules/webp-converter');

grant_permission()
mkdirSync(resolve(webpDir, 'temp'), { recursive: true });
chmodSync(webpDir, 0o775);
chmodSync(resolve(webpDir, 'temp'), 0o775);

export class ImageProcessor {
  constructor(
    private baseImagesUrl: string,
    private outputDir = 'dataGenerated'
  ) {}

  private async getPngBufferFromPathBlp(path: string) {
    const data = decodeBLP((await readFile(path)).buffer);
    const imageData = getBLPImageData(data, 0);

    const png = new PNG({
      width: data.width,
      height: data.height,
      inputHasAlpha: true,
    });

    png.data = Buffer.from(imageData.data.buffer);
    const stream = new PassThrough();
    png.pack().pipe(stream);

    return buffer(stream);
  }

  private async getPngBufferFromPathDds(path: string) {
    const imageBuffer = await readFile(path)
    const imageInfo = parseDDSHeader(imageBuffer)

    if (!imageInfo) return

    const png = new PNG({
      width: imageInfo.shape.width,
      height: imageInfo.shape.height,
      inputHasAlpha: true,
    });

    png.data = decodeImage(imageBuffer, imageInfo.format, imageInfo.layers[0])

    const stream = new PassThrough();
    png.pack().pipe(stream);

    return buffer(stream);
  }



  private async getPngBufferFromPath(path: string) {
    const nonExtensionPath = (() => {
      const parts = path.split('.')
      parts.pop()
      return parts.join('.')
    })();
    const blpPath = resolve(this.baseImagesUrl, `${nonExtensionPath}.blp`)
    if (existsSync(blpPath)) {
      return this.getPngBufferFromPathBlp(blpPath)
    }
    const ddsPath = resolve(this.baseImagesUrl, `${nonExtensionPath}.dds`)
    if (existsSync(ddsPath)) {
      return this.getPngBufferFromPathDds(ddsPath)
    }
  }

  async processImages(
    images: Record<string, string>,
    /**Without extension */
    outputName: string
  ) {
    const buffers = await Object.entries(images).reduce(
      async (acc, [name, path]) => {
        const prevAcc = await acc;
        const imageBuffer = await this.getPngBufferFromPath(path);
        if (imageBuffer) {
          prevAcc[name] = imageBuffer;
        }
        return prevAcc;
      },
      Promise.resolve({} as Record<string, Buffer>)
    );

    const sprite = await new Promise<SpritesmithResult<Buffer>>((res, rej) => {
      Spritesmith.run(
        {
          padding: 2,
          src: Object.entries(buffers).map(
            ([name, buffer]) =>
              new Vinyl({
                path: `${name}.png`,
                contents: buffer,
              })
          ),
        },
        (err, data) => (err ? rej(err) : res(data))
      );
    });

    const webpBuffer = await buffer2webpbuffer(sprite.image, 'png', '-q 75');
    await writeFile(
      resolve(process.cwd(), this.outputDir, `${outputName}.webp`),
      webpBuffer
    );

    const shortenCoordinates = Object.entries(sprite.coordinates).reduce(
      (acc, [key, { x, y, width, height }]) => {
        const [id] = key.split('.');
        acc[id] = [x,y,width,height];
        return acc;
      },
      {} as Record<string, [x: number, y: number, width: number, height: number]>
    );
    return shortenCoordinates;
  }
}
