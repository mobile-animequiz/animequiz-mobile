# AnimeQuiz — revisão para o APK
Atualizado em 19/11/2026. Este documento substitui os bloqueios antigos registrados em ENTREGA_ATUAL.md.

## Correções desta revisão
- Restauração do visual de 6eee26e: paleta azul, degradê com sete paradas, medidas e tipografia originais, botões principais escuros. As funções de perfil, foto, favoritos, idioma e movimento reduzido foram preservadas.
- Remoção do seletor de versão, do provider de seleção e do texto “API V...” no quiz. O contrato 1 é fixo internamente; variáveis antigas de versão não mudam o app. A API continua oferecendo seus contratos no Swagger.
- Erro RNGoogleSignin corrigido: o SDK só é carregado quando Google é acionado, após conferir o módulo nativo. Expo Go e APKs antigos recebem uma mensagem de indisponibilidade, sem derrubar as demais telas.
- package-lock.json atualizado a partir da instalação real do clone do usuário. Manifesto e lockfile conferem; todos os módulos usados pelo código estão presentes.
- npm run android agora compila o aplicativo nativo. O launcher seleciona um JDK completo, detecta o SDK e executa prebuild sem apagar a pasta nativa, atualizando ícones, splash e permissões antes da compilação.
- A instalação apontada pelo JAVA_HOME deste computador não contém lib/tzdb.dat. O launcher Android usa o JDK completo do Android Studio como alternativa, sem mudar as configurações globais do sistema.
- Ícone, versão adaptativa/monocromática e splash continuam configurados com a marca AnimeQuiz, sem os assets padrão do Expo. Nome do aplicativo: AnimeQuiz; pacote: com.sn6team.animequiz; projeto EAS preservado.
- API: /, /docs e /docs.html redirecionam para o Swagger padrão, sem página customizada, vídeo ou plano de fundo. V1 é a apresentação inicial. Schemas/exemplos de erro corrigidos para APIError.

## Verificações concluídas
| Verificação | Resultado |
|---|---|
| npm test | 17 testes aprovados |
| npm run lint | Aprovado, com todas as regras normais |
| npm run typecheck | Aprovado; projeto JS com checkJs=false |
| expo install --check | Compatibilidade local aprovada; consulta remota indisponível |
| Expo Doctor | 19/21 aprovadas; duas consultas remotas falharam por DNS |
| Exportação Android | Aprovada: bundle Hermes, 1364 módulos |
| Exportação web | Aprovada: 12 rotas estáticas |
| Expo prebuild Android | Aprovado |
| Autolinking Google | Confirmado RNGoogleSigninPackage e RNGoogleSignInCGen no Android |
| Recursos nativos | Gerados e conferidos ícones launcher/adaptativo/monocromático e splash; nome AnimeQuiz e INTERNET presentes |
| API | 297 testes aprovados com javac --release 17 e JUnit Jupiter |
| Run-Api.ps1 | Sintaxe PowerShell conferida |

Os 297 testes foram executados com dependências cacheadas e o JDK do IDE. Maven padrão ainda não concluiu: faltam dependências dos plugins no cache e não há acesso ao Maven Central. O APK físico e o desempenho nos celulares ainda não foram validados.

## O que ainda impede o APK assinado neste ambiente
- api.expo.dev não resolve por DNS; a CLI EAS não consegue consultar a conta nem iniciar o build remoto.
- services.gradle.org não resolve por DNS; a compilação nativa local parou ao baixar Gradle 9.3.1.
- GitHub não resolve por DNS; commits locais não significam push confirmado.
- A API pública não pôde ser verificada por rede. O preflight final exige os endpoints novos antes de liberar o build.

Não existe um APK final novo nem link de download desta revisão. O bundle Android e a pasta android gerada não equivalem a um APK. Não foi oferecido um APK de debug como versão final.

## Comandos no terminal normal do computador
Use a cópia em:
C:\Users\Isaac\Documents\Codex\2026-11-18\sites-plugin-sites-openai-curated-remote\work\animequiz-next\mobile

Com rede disponível:
1. npm.cmd ci
2. npm.cmd run lint
3. npm.cmd test
4. npm.cmd run typecheck
5. npm.cmd run expo:whoami (ou expo:login, se necessário)
6. npm.cmd run build:apk:final

O comando final repete as verificações e consulta a API antes de iniciar o EAS. Use a mesma conta/projeto/assinatura do APK anterior. Ao concluir, o EAS fornecerá o link para baixar o APK instalável.

Para testar localmente com Android Studio: npm.cmd run android.
Para testar as telas no Expo Go: npm.cmd run start:go. Login Google não funciona no Expo Go. Seu ícone de launcher continua sendo o do Expo Go; o ícone AnimeQuiz é aplicado no aplicativo compilado.

Se já há APK instalado e o Android recusar uma atualização por certificado diferente, use a assinatura original do EAS. O build de desenvolvimento local pode ter assinatura diferente.

## Configurações externas preservadas
Google: EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no ambiente preview do EAS; o mesmo ID WEB em GOOGLE_CLIENT_IDS na API; cliente Android com pacote com.sn6team.animequiz e SHA-1 do certificado usado no APK. Não colocar client secret no app.

E-mail: MAIL_API_KEY e MAIL_FROM do Resend, com domínio/remetente verificados, e PUBLIC_APP_ORIGIN HTTPS servindo /reset-password.html. Os testes de autenticação/recuperação usam adapters substituídos; Google e envio real ainda precisam de validação com suas credenciais.

Banco: configurar volume persistente e DB_URL; preservar JWT_SECRET estável e realizar backup/exportação antes de trocar o datasource. O código não transfere automaticamente dados de uma antiga base em memória. Consulte o guia da API.

## Git e aplicação das correções
Todas as alterações foram feitas nas cópias work/animequiz-next/mobile e work/animequiz-next/api. O clone em C:\Users\Isaac\animequiz-mobile não foi sobrescrito. Suas alterações locais foram preservadas.

As branches de correção são feat/android-baseline (mobile) e feat/animequiz-next (API). Como os PRs anteriores já foram mesclados, as correções precisam de um novo PR ou integração equivalente.

Para enviar os commits pelo seu terminal com acesso ao GitHub, a partir de work/animequiz-next:
git -C mobile push -u origin feat/android-baseline
git -C api push -u origin feat/animequiz-next

Após integrar os novos PRs, atualize seu clone. Se o Git avisar de alterações locais, preserve-as antes de atualizar. Não use reset --hard para descartar seu trabalho.
