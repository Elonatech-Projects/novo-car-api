// Nest's `start --watch` incremental recompile re-registers schemas (e.g.
// AuthSchema's `unique: true` email index) against the same long-lived
// Mongoose connection, which trips Mongoose's own duplicate-index check in
// node_modules/mongoose/lib/schema.js and prints a MONGOOSE process warning.
// There is only one `unique: true` declaration on Auth.email in the actual
// source — this is a dev-only hot-reload artifact, not a real duplicate
// index bug, so only this specific message is dropped; everything else
// still reaches stderr normally.
const originalEmitWarning = process.emitWarning.bind(process);

process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
  const message = typeof warning === 'string' ? warning : warning.message;
  if (message.includes('Duplicate schema index')) return;
  return (originalEmitWarning as (...a: unknown[]) => void)(warning, ...args);
}) as typeof process.emitWarning;
