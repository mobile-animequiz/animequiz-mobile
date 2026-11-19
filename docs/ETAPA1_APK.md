# AnimeQuiz: APK da versão atual

Situação em 19/11/2026: configuração preparada e verificações locais parciais. **O APK ainda não foi gerado.**

Base examinada: mobile `6eee26e`, API `fb26078`, com o `package-lock.json` que já havia sido gerado na cópia local do mobile. O trabalho está na branch `feat/android-baseline`, em uma cópia separada. A API e as pastas originais abertas nas IDEs não foram alteradas nesta etapa.

## O que foi preparado

- Perfil EAS `current`, que herda o APK interno de `preview`, fixa a origem HTTPS do Render e usa inicialmente o contrato 1. O perfil `preview` continua disponível. A interface de seleção de versão não foi alterada.
- `npm run check:apk`: verifica formato APK, vínculo do projeto Expo, identificador Android, URL pública HTTPS, contrato inicial, arquivos PNG e compatibilidade do lockfile com o manifesto. A identidade visual dos arquivos é uma avaliação separada.
- `npm run check:apk -- --online`: acrescenta consultas públicas ao status da API e ao catálogo. Não consulta senhas, não cria usuários e não envia tentativas.
- `npm run build:apk:current`: executa a verificação com rede e solicita o build EAS Android do perfil `current`.
- `.easignore` para evitar o envio de dependências locais, arquivos de ambiente, chaves e artefatos de IDE.
- Removida a chamada redundante a `dismissAll` depois de entrar/sair. As rotas `Stack.Protected` já removem do histórico as telas que deixaram de ser permitidas. Essa chamada era compatível com o aviso `POP_TO_TOP` observado no terminal; a correção ainda precisa ser conferida no Android.

## Por que o build ainda não aconteceu

O ambiente de execução desta revisão não consegue resolver `registry.npmjs.org` nem o host da API. A instalação da CLI EAS e a checagem online terminaram com `ENOTFOUND`. Isso não demonstra que esses serviços estão fora do ar nem que a conexão do celular falha.

Não há CLI EAS utilizável em cache. Também não foi possível validar um build nativo local com as ferramentas e dependências disponíveis. A conta Expo, as permissões sobre o projeto e as credenciais de assinatura ainda não foram verificadas.

## Preparar e gerar no terminal do computador

Abra esta cópia de trabalho no VS Code. Os comandos abaixo usam os executáveis `.cmd`, evitando o bloqueio de scripts `.ps1` do PowerShell.

```powershell
cd "C:\Users\Isaac\Documents\Codex\2026-11-18\sites-plugin-sites-openai-curated-remote\work\animequiz-next\mobile"
npm.cmd ci
npx.cmd expo install --check
npm.cmd run check:apk -- --online
```

Se a instalação ou o check de dependências falhar, corrija esse erro antes de prosseguir. Não use `npm audit fix --force` para tentar resolver automaticamente incompatibilidades do Expo.

Confirme a configuração e o bundle:

```powershell
npx.cmd expo config --type public
npx.cmd expo export --platform android
```

O projeto original é JavaScript. Ainda não há `tsconfig.json`; `tsc --noEmit` apenas mostrou a ajuda do compilador nesta revisão. Isso não representa uma checagem de tipos concluída. O lint completo também tem falhas preexistentes de hooks que estão registradas no acompanhamento da entrega.

Entre com a conta que possui acesso ao projeto Expo existente:

```powershell
npx.cmd eas-cli@latest login
npx.cmd eas-cli@latest whoami
npx.cmd eas-cli@latest project:info
npm.cmd run build:apk:current
```

O projeto configurado tem ID `2ef330d1-cc20-4fc2-99c8-ec210409c626`, slug `mobile-animequiz` e pacote Android `com.sn6team.animequiz`. Se a conta não tiver acesso, obtenha acesso do responsável por esse projeto. A organização GitHub e a conta/organização Expo são permissões diferentes. Preserve o vínculo existente; não crie outro projeto automaticamente para contornar um erro de acesso.

Faça o login diretamente na CLI. Senha, token Expo e chave de assinatura não devem ser enviados pelo chat nem adicionados ao repositório. Na configuração de assinatura, use a chave existente se este aplicativo já tiver APKs distribuídos. Se for o primeiro build, o responsável pela conta poderá configurar a assinatura seguindo o fluxo da CLI.

O build só estará disponível depois de a tarefa EAS concluir com sucesso. Use o link real de instalação exibido pela CLI ou pela página de detalhes do build. Não há link de APK para esta etapa ainda.

## Instalar e conferir

1. Abra o link do APK concluído no celular Android e baixe o arquivo `.apk`.
2. Se o Android solicitar, permita a instalação para o aplicativo usado nesse download e conclua a instalação.
3. Abra o AnimeQuiz sem depender do servidor Metro do computador.
4. Confira cadastro e login por e-mail; complete um quiz e compare resultado, XP e estatísticas.
5. Feche e reabra o aplicativo para conferir a restauração da sessão. Saia da conta e confirme que o botão Voltar não reabre as telas protegidas.
6. Repita o carregamento e uma tentativa usando dados móveis, para verificar a API fora da rede local. Provoque perda de conexão e confira a mensagem e a repetição manual do envio.
7. Registre o ID/link do build, modelo do celular, versão Android e resultado das verificações. Uma execução em Expo Go ou um bundle exportado não substituem esse teste do APK instalado.

O cadastro Google, a recuperação de senha, a edição de perfil, os favoritos persistentes e as melhorias visuais são etapas seguintes. Os botões já existentes de Google e recuperação ainda não têm suporte funcional no backend atual.

## Documentação consultada

- [APK Android no Expo](https://docs.expo.dev/build-reference/apk/)
- [Configuração de build e assinatura](https://docs.expo.dev/build/setup/)
- [Configuração do SDK 57](https://docs.expo.dev/versions/v57.0.0/config/app/)
- [Histórico de rotas protegidas](https://docs.expo.dev/router/advanced/protected/)
