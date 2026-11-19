# AnimeQuiz — revisão para apresentação acadêmica

19/11/2026 · aplicativo 1.1.0. Este registro complementa REVISAO_FINAL.md com a correção mais recente do upload.

## Foto de perfil no Expo 57

O Expo 57 instala expo/fetch como fetch global no Android/iOS. O codificador multipart não aceita o descritor antigo de arquivo `{ uri, name, type }`, que era usado por accountService. Isso pode virar a mensagem genérica de falha de conexão mesmo antes de existir uma resposta HTTP.

A revisão usa File de expo-file-system no Android/iOS e Blob na web, selecionando o fluxo por Platform.OS. O arquivo local é validado antes da requisição: deve existir, conter bytes e ter até 2 MiB. O fetch define o boundary multipart. A foto continua sendo recortada e convertida em JPEG 512 × 512 no perfil; o prazo de upload agora é 90 segundos.

O teste executa o codificador real do SDK instalado: o formato antigo é rejeitado e o File novo produz os bytes, filename, MIME e boundary esperados. Isso comprova a correção da incompatibilidade no cliente; o envio completo ao servidor público e nos aparelhos ainda precisa ser conferido.

Fontes: https://docs.expo.dev/versions/v57.0.0/sdk/expo.md e https://docs.expo.dev/versions/v57.0.0/sdk/filesystem.md.

## Dependências e verificação

- Reanimated 4.5.1 e Worklets 0.10.1, alinhados ao Expo instalado; alterações trazidas da instalação corrigida no clone do usuário.
- expo-file-system ~57.0.7 declarado diretamente e conferido pelo preflight.
- 21 testes do mobile, lint e typecheck aprovados.
- Exportação Android aprovada: 1372 módulos, bundle Hermes de 3 MB em dist/academic-android. Esse bundle não é um APK instalável.
- A API passou em 302 testes pelo Maven. Dois novos testes HTTP reais são opcionais: a tentativa nesta execução foi bloqueada pela restrição de loopback. Consulte AvatarHttpIntegrationTest e o guia da API.
- O PDF de estudo foi entregue separadamente, com 24 capítulos sobre o código, exemplos, revisão e apresentação ao professor.

## Gerar o APK desta revisão

As correções estão em work/animequiz-next/mobile. O clone C:\Users\Isaac\animequiz-mobile não foi sobrescrito. Para obter o upload corrigido, use esta cópia de trabalho ou integre os novos commits e atualize seu clone preservando alterações locais.

No CMD:

```cmd
cd /d "C:\Users\Isaac\Documents\Codex\2026-11-18\sites-plugin-sites-openai-curated-remote\work\animequiz-next\mobile"
npm.cmd ci
npm.cmd run build:apk:final
```

Use a mesma conta/projeto EAS e a assinatura anterior. Se necessário, execute npm.cmd run expo:login. O perfil final gera APK interno e incrementa versionCode; o EAS fornece o link de download depois do build.

A tentativa nesta revisão aprovou os checks locais e parou na consulta à API pública com ENOTFOUND. Nenhum job EAS foi criado e nenhum APK novo foi produzido. Não há um link de download do APK desta revisão.

## Demonstração e limites

Confirme a API pública atualizada, login, quiz, resultado, favoritos, reabertura e foto nos dois aparelhos. Teste também em dados móveis com o computador desligado. Google e envio real de e-mail dependem das credenciais; não foram homologados por esta execução. Persistência exige banco/volume durável no servidor.

O ícone AnimeQuiz é aplicado no aplicativo compilado. Abrir pelo Expo Go continua mostrando o ícone do Expo Go. O teste de galeria no emulador não substitui o teste do APK em celular.
