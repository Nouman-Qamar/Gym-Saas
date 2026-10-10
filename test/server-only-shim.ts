// Next.js provides a build-time shim for the "server-only" package that
// makes `import "server-only"` a no-op on the server and a hard error if
// ever bundled into client code. Vitest runs outside Next's bundler, so it
// can't resolve the (uninstalled) real package — this file stands in for it
// when running unit tests directly against server-side modules in lib/.
export {};
