# AnimeQuiz 1.1.0 — revisão atual

[Guia para o APK e estado real da entrega](docs/REVISAO_FINAL.md). Lockfile atualizado, 17 testes e lint completo aprovados. Visual original restaurado e seletor de API removido. Ainda falta o build assinado e a validação física.

# AnimeQuiz Mobile

App Expo SDK 57 / React Native 0.86 para consumir a API Java do AnimeQuiz.

## Instalar e executar

Use Node compatível com o Expo SDK 57 e acesso à internet. Na pasta `mobile`:

```powershell
npm install
npx expo install --fix
npx expo-doctor
npm test
npm run lint
npx expo start
```

O `package-lock.json` recebido estava desatualizado: as versões de Expo, Router e Splash não correspondiam ao `package.json`, e o SecureStore não constava no lock. Ele foi retirado desta cópia para permitir uma instalação coerente. `npm install` cria um novo lock; revise e versione esse arquivo antes de compartilhar ou repetir o build. Não use `npm ci` antes dessa instalação.

As dependências continuam no SDK 57. Não use um Expo SDK diferente apenas para conseguir instalar.

## Conectar à API

Copie `.env.example` para `.env.local` se precisar substituir a URL padrão:

```dotenv
EXPO_PUBLIC_API_URL=https://animequiz-api-wst8.onrender.com
EXPO_PUBLIC_API_VERSION=1
```

Use apenas a origem da API: sem `/api/v1`, `/quizzes` ou `/auth` no final. O versionamento ocorre pelo cabeçalho `X-API-Version`.

No celular físico, `localhost` identifica o próprio celular. Para testar uma API local no Expo Go, coloque o IP do computador, por exemplo `http://192.168.0.10:8080`; mantenha os dispositivos na mesma rede. O APK de apresentação deve usar uma API HTTPS acessível pelo celular. Não foi acrescentada permissão para HTTP em builds de produção.

Variáveis `EXPO_PUBLIC_*` vão no aplicativo. Não coloque JWT_SECRET, senha de banco ou chaves privadas nessas variáveis.

## Funcionalidades e versões

| Ação | Comportamento |
|---|---|
| Cadastro/login | Usa `/auth/register` e `/auth/login`; guarda o JWT no SecureStore nativo. |
| Home | Carrega catálogo, perfil e estatísticas da API. |
| V1/V2 | A Home verifica a versão no servidor antes de trocar e envia o cabeçalho em todas as requisições seguintes. A seleção dura a sessão atual do app. |
| V1 | Questões e alternativas no contrato original, sem imagens. |
| V2 | Acrescenta imagem opcional, texto acessível e tempo sugerido. O servidor precisa ser atualizado com a API deste pacote. |
| Quiz | Alternativas coloridas, seleção destacada, progresso e confirmação da resposta. |
| Cronômetro | Opcional na Home. Ao zerar, a pergunta fica sem resposta. O tempo continua contando quando o app vai para segundo plano. |
| Falha de imagem | Exibe uma mensagem e mantém a pergunta disponível. |
| Resultado | Usa os pontos e acertos retornados pela API. A confirmação por pergunta não informa acerto ou erro. |
| Reenvio | Reutiliza `X-Idempotency-Key` ao tentar enviar novamente a mesma partida. |

O cronômetro é uma regra da interface, sem bônus por velocidade nem fiscalização no servidor. Se todas as perguntas expirarem sem resposta, a partida não gera score: o app permite recomeçar ou voltar ao início. O projeto atual oferece partidas individuais; salas e partidas simultâneas não foram implementadas.

## Gerar APK de apresentação

Atualize primeiro o backend publicado. Confirme na Home que V2 se conecta e que as imagens aparecem.

```powershell
npx eas-cli@latest login
npx eas-cli@latest whoami
npm run build:apk
```

O comando usa o perfil `preview` de `eas.json`, com distribuição interna e `android.buildType: apk`. O perfil inicia em V2. O projeto Expo existente foi preservado (`extra.eas.projectId`); a conta autenticada precisa ter acesso a ele. Se a CLI solicitar configuração de assinatura Android, siga o fluxo da sua conta. Não envie chaves de assinatura no repositório.

Depois que o serviço concluir o build, baixe o APK pelo link retornado e instale no celular. Abra o app sem o Metro e valide cadastro/login, partida e resultado. O APK não foi produzido neste ambiente: faltam as dependências e a CLI de build, e a rede necessária para instalá-las está indisponível.

Referências oficiais: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [APK Android](https://docs.expo.dev/build-reference/apk/).
