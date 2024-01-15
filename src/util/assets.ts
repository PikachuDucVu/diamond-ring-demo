import {
  AssetManager,
  BitmapFont,
  Texture,
  TextureAtlas,
  TextureOptions,
} from "gdxts";

export class Assets<Atlases, Textures, Fonts> {
  private assetManager: AssetManager;
  constructor(gl: WebGLRenderingContext) {
    this.assetManager = new AssetManager(gl);
  }
  atlas<K extends string>(
    name: K,
    url: string,
    useMipMaps = false
  ): Assets<Atlases & { [key in K]: string }, Textures, Fonts> {
    this.assetManager.loadAtlas(url, name, useMipMaps);
    return this as any;
  }
  texture<K extends string>(
    name: K,
    url: string,
    options?: Partial<TextureOptions>
  ): Assets<Atlases, Textures & { [key in K]: string }, Fonts> {
    this.assetManager.loadTexture(url, name, options);
    return this as any;
  }
  font<K extends string>(
    name: K,
    url: string,
    flip = false
  ): Assets<Atlases, Textures, Fonts & { [key in K]: string }> {
    this.assetManager.loadFont(url, name, flip);
    return this as any;
  }
  async finishLoading() {
    await this.assetManager.finishLoading();
  }
  getAtlas<K extends keyof Atlases>(name: K): TextureAtlas | undefined {
    if (typeof name !== "string") {
      throw new Error("Atlas name must be a string");
    }
    return this.assetManager.getAtlas(name);
  }
  getTexture<K extends keyof Textures>(name: K): Texture | undefined {
    if (typeof name !== "string") {
      throw new Error("Texture name must be a string");
    }
    return this.assetManager.getTexture(name);
  }
  getFont<K extends keyof Fonts>(name: K): BitmapFont | undefined {
    if (typeof name !== "string") {
      throw new Error("Font name must be a string");
    }
    return this.assetManager.getFont(name);
  }
  dispose() {
    this.assetManager.disposeAll();
  }
  getDone(): number {
    return this.assetManager.getDone();
  }
  getTotal(): number {
    return this.assetManager.getTotal();
  }
}
