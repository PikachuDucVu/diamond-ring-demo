import { Assets } from "./util/assets";

export const getAssets = (gl: WebGLRenderingContext) => {
  const assets = new Assets(gl);
  return assets;
};
