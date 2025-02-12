const { spawnSync } = require('child_process')
const glob = require('glob')

const cwd = require('path').join(__dirname, '..')

const files = glob.sync('test/**/*.test.js', { cwd })

files.forEach((f) => {
  test(f)
})

function test (f) {
  const r = spawnSync('node', ['--expose-gc', './script/test-entry.js', f], { cwd, env: process.env, stdio: 'inherit' })
  if (r.status !== 0) {
    process.exit(r.status)
  }
  console.log()
}
