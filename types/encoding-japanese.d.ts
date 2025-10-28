declare module 'encoding-japanese' {
  export function detect(
    data: Uint8Array | number[] | string,
    encodings?: string | string[]
  ): string | boolean;

  export function convert(
    data: Uint8Array | number[] | string,
    options: {
      to: string;
      from?: string;
      type?: 'string' | 'arraybuffer' | 'array';
    }
  ): number[] | Uint8Array | string;

  export function codeToString(code: number[] | Uint8Array): string;

  export function stringToCode(str: string): number[];

  export function urlEncode(data: number[] | Uint8Array): string;

  export function urlDecode(str: string): number[];

  export function base64Encode(data: number[] | Uint8Array): string;

  export function base64Decode(str: string): number[];
}
