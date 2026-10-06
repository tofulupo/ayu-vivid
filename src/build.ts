// Generates every port from the ayu palette. Each port lives in src/<port>.ts
// and writes into its own top-level folder. To add one, create the module with
// a `build()` that returns a short summary, and list it here.
//
// Flags: --vivid=<factor> (syntax saturation, default 1.2), --p3 (Zed only).
import * as cosmic from './cosmic.ts'
import * as firefox from './firefox.ts'
import * as kagi from './kagi.ts'
import * as vim from './vim.ts'
import * as zed from './zed.ts'

for (const port of [zed, cosmic, vim, firefox, kagi]) console.log(port.build())
