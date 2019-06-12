import { Transform } from "stream";
import { _decodeImage } from "./utils";

/**
 * Transforms binary data into zpl
 * @param data
 * @param zplInit
 */
export function imageToZpl(data: Buffer, zplInit?: string): Promise<string> {
  return _decodeImage(data).then(zpl => {
    return zplInit ? zplInit + "\n" + zpl : zpl;
  });
}

/**
 * Creates a stream that accept image binary data and spits out zpl string
 * @param zplInit
 */
export function transformBmpToZpl(zplInit?: string): Transform {
  const stream = new Transform();
  const buffers: Buffer[] = [];
  stream._transform = (data, encoding, callback) => {
    buffers.push(data);
    callback();
  };

  stream._flush = callback => {
    // flush is called before closing the stream
    const data = Buffer.concat(buffers);
    buffers.length = 0; // signal the GC buffers are garbage now

    imageToZpl(data, zplInit)
      .then(zpl => {
        stream.push(zpl);
      })
      .catch(callback);
  };

  return stream;
}
