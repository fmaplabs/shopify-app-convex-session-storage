## 0.1.7

- Convex 1.46 compatibility: `ConvexSessionClient` and `SessionFunctionRefs` now
  duck-type function references via the `_type` slot instead of the deprecated
  `_returnType`/`_args` slots (dropped by `FunctionReference_future`), restoring
  assignability of `ConvexHttpClient` on convex 1.46. Works on all convex
  versions in the peer range.
- Update dev toolchain to `convex` 1.46 and `convex-test` 0.0.59; regenerate
  codegen.

## 0.1.3

## 0.1.6

## 0.1.5
