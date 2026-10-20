/** Chrome half of an EChartsOption, read from the v2 tokens on a live DOM node. */
export declare function dsEChartsTheme(
  el?: Element | null,
  opts?: { zoom?: boolean; legend?: boolean; toolbox?: boolean },
): Record<string, unknown>;

export declare namespace dsEChartsTheme {
  function read(el?: Element | null): Record<string, string | number>;
}

export default dsEChartsTheme;
