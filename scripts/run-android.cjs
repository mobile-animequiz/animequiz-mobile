const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const windows = process.platform === 'win32';
const programFiles = process.env.ProgramFiles || 'C:\\Program Files';
function usableJdk(home) {
  return home && fs.existsSync(path.join(home, 'bin', windows ? 'java.exe' : 'java'))
    && fs.existsSync(path.join(home, 'lib', 'tzdb.dat'));
}
const candidates = [process.env.JAVA_HOME];
if (windows) {
  candidates.push(path.join(programFiles, 'Android', 'Android Studio', 'jbr'));
  const jetbrains = path.join(programFiles, 'JetBrains');
  if (fs.existsSync(jetbrains)) {
    for (const dir of fs.readdirSync(jetbrains)) candidates.push(path.join(jetbrains, dir, 'jbr'));
  }
}
const javaHome = candidates.find(usableJdk);
if (!javaHome) {
  console.error('Configure JAVA_HOME com um JDK completo (17 ou superior, compatível com o Gradle do projeto). A instalação precisa conter bin/java e lib/tzdb.dat.');
  process.exit(1);
}
const sdkCandidates = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT,
  windows ? path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk') : null,
  windows ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'), 'Android', 'Sdk')
    : process.platform === 'darwin' ? path.join(os.homedir(), 'Library', 'Android', 'sdk') : path.join(os.homedir(), 'Android', 'Sdk')];
const androidHome = sdkCandidates.find((dir) => dir && fs.existsSync(path.join(dir, 'platform-tools')));
if (!androidHome) {
  console.error('Configure ANDROID_HOME com o Android SDK instalado pelo Android Studio.');
  process.exit(1);
}
console.log('Java: ' + javaHome);
console.log('Android SDK: ' + androidHome);
if (process.argv.includes('--check')) process.exit(0);
const expo = path.join(path.dirname(require.resolve('expo/package.json')), 'bin', 'cli');
const nativeEnv = { ...process.env, JAVA_HOME: javaHome, ANDROID_HOME: androidHome, ANDROID_SDK_ROOT: androidHome };
// Refresh generated icon, splash and permission resources before compiling.
// No --clean: do not recursively delete a developer's existing native folder.
const prebuild = spawnSync(process.execPath, [expo, 'prebuild', '--platform', 'android', '--no-install'], {
  cwd: root, stdio: 'inherit', env: nativeEnv,
});
if (prebuild.error) console.error(prebuild.error.message);
if (prebuild.status !== 0) process.exit(prebuild.status ?? 1);
const result = spawnSync(process.execPath, [expo, 'run:android', ...process.argv.slice(2)], {
  cwd: root, stdio: 'inherit',
  env: nativeEnv,
});
if (result.error) console.error(result.error.message);
process.exit(result.status ?? 1);

