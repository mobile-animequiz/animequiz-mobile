const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'..');
function read(name){return JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));}
async function main(){
  const pkg=read('package.json'),eas=read('eas.json');
  for(const name of ['expo-file-system','expo-image-picker','expo-image-manipulator','expo-localization','@react-native-google-signin/google-signin']){
    try{require.resolve(name+'/package.json',{paths:[root]});}catch{throw new Error('Falta instalar '+name+'. Execute npm run setup:next com acesso ao npm.');}
  }
  const lock=read('package-lock.json');
  for(const group of ['dependencies','devDependencies'])assert.deepEqual(lock.packages[''][group],pkg[group],'Lockfile pendente. Execute npm run setup:next e registre package-lock.json antes do build.');
  const baseline=spawnSync(process.execPath,[path.join(__dirname,'check-apk.cjs')],{cwd:root,stdio:'inherit'});
  assert.equal(baseline.status,0,'A configuração básica do APK falhou.');
  const profile=eas.build.final;
  assert.equal(profile.extends,'current');
  assert.equal(profile.autoIncrement,true);
  assert.equal(profile.environment,'preview');
  console.log('OK perfil final: APK interno, contrato 1, assinatura/projeto existentes e versionCode incremental.');
  if(!process.argv.includes('--online')){console.log('Backend não verificado; use --online antes do build final.');return;}
  const origin=eas.build.current.env.EXPO_PUBLIC_API_URL;
  const docs=await fetch(origin+'/api-docs/v1',{signal:AbortSignal.timeout(45000),redirect:'error'});
  assert(docs.ok,'Não foi possível ler /api-docs/v1: HTTP '+docs.status);
  const openapi=await docs.json();
  for(const endpoint of ['/users/me/settings','/users/me/avatar','/users/me/favorites','/users/me/favorites/{quizId}','/auth/google','/auth/google/link','/auth/forgot-password','/auth/reset-password'])
    assert(openapi.paths?.[endpoint],'Publique a API atualizada antes do APK: falta '+endpoint);
  const reset=await fetch(origin+'/reset-password.html',{signal:AbortSignal.timeout(45000),redirect:'error'});
  assert(reset.ok,'A página pública de nova senha ainda não está publicada.');
  console.log('OK contratos e página de redefinição disponíveis. Google/e-mail reais e testes nos celulares continuam validações separadas.');
}
main().catch(error=>{console.error('APK final interrompido: '+error.message);if(error.cause?.code)console.error('Rede: '+error.cause.code);process.exitCode=1;});

