const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{spawnSync}=require('child_process');
const {getPublicResource}=require('./api-preflight.cjs');
const root=path.resolve(__dirname,'..');
function read(name){return JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));}
async function main(){
  const pkg=read('package.json'),eas=read('eas.json');
  for(const name of ['expo-file-system','expo-image-picker','expo-image-manipulator','expo-localization','@react-native-google-signin/google-signin']){
    try{require.resolve(name+'/package.json',{paths:[root]});}catch{throw new Error('Falta instalar '+name+'. Execute npm run setup:next com acesso ao npm.');}
  }
  const lock=read('package-lock.json');
  for(const group of ['dependencies','devDependencies'])assert.deepEqual(lock.packages[''][group],pkg[group],'Lockfile pendente. Execute npm run setup:next e registre package-lock.json antes do build.');
  const baseline=spawnSync(process.execPath,[path.join(__dirname,'check-apk.cjs'),'--config-only'],{cwd:root,stdio:'inherit'});
  assert.equal(baseline.status,0,'A configuração básica do APK falhou.');
  const profile=eas.build.final;
  assert.equal(profile.extends,'current');
  assert.equal(profile.autoIncrement,true);
  assert.equal(profile.environment,'preview');
  console.log('OK perfil final: APK interno, contrato 2, assinatura/projeto existentes e versionCode incremental.');
  if(!process.argv.includes('--online')){console.log('Backend não verificado; use --online antes do build final.');return;}
  const origin=eas.build.current.env.EXPO_PUBLIC_API_URL;
  const deadline=Date.now()+180000;
  console.log('Aguardando a API pública. A primeira resposta pode demorar se o serviço estiver iniciando.');
  const status=await getPublicResource(origin,'/api/versioned/status',{deadline,waitForJson:true});
  assert(String(status.version)==='1'&&status.status==='ok','A API não confirmou o contrato 1.');
  const openapi=await getPublicResource(origin,'/api-docs/v2',{deadline});
  for(const endpoint of ['/users/me/settings','/users/me/avatar','/users/me/favorites','/users/me/favorites/{quizId}','/quizzes/{quizId}/questions','/auth/login','/auth/register'])
    assert(openapi.paths?.[endpoint],'Publique a API atualizada antes do APK: falta '+endpoint);
  assert(openapi.paths?.['/quizzes']?.get?.parameters?.some(parameter=>parameter.name==='lang'),'Publique a API com suporte a idioma antes do APK.');
  console.log('OK contratos V2 e idioma disponíveis. Google/e-mail reais e testes nos celulares continuam validações separadas.');
}
main().catch(error=>{console.error('APK final interrompido: '+error.message);if(error.cause?.code)console.error('Rede: '+error.cause.code);process.exitCode=1;});

