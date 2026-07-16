/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_NAVIGATION_TIMING_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
