# AnimeQuiz Mobile 1.2.0

Aplicativo Expo SDK 57 / React Native 0.86 com Expo Router para jogar quizzes da API Java. Esta revisão fixa o contrato **V2** internamente, sem seletor de versão para o jogador.

Leia o [guia da entrega](docs/ENTREGA_V2.md) e as [três propostas de ícone](docs/ICON_CONCEPTS.md). O ícone atual foi preservado, aguardando aprovação. Documentos antigos descrevem etapas anteriores e não substituem este guia.

## Instalação e desenvolvimento

Na pasta deste repositório, execute separadamente:

```powershell
npm.cmd ci
npm.cmd run start:go
```

O lockfile está versionado. Não é necessário executar `expo install --fix` nem `npm audit fix --force` para iniciar. `npm start expo` é incorreto: o argumento extra é interpretado como uma pasta.

## Configurar a API

Copie `.env.example` para `.env.local` se precisar substituir a origem:

```dotenv
EXPO_PUBLIC_API_URL=https://animequiz-api-wst8.onrender.com
```

Use a origem sem `/api/v2` ou `/quizzes`. O app envia `X-API-Version: 2`; variáveis antigas de versão são ignoradas. Publique a API desta revisão antes de testar capas e traduções no servidor público.

No emulador Android, `http://10.0.2.2:8080` acessa o computador. No celular físico com Expo Go, use o IP do computador na mesma rede. `localhost` no celular aponta para o próprio celular. Um APK distribuído deve usar HTTPS público. Nunca coloque segredos em `EXPO_PUBLIC_*`.

## Recursos

| Recurso | Comportamento |
|---|---|
| Sessão | JWT no SecureStore nativo; dados privados exigem autenticação. |
| Nome | Personalizado/cadastrado tem prioridade; sem nome real, usa o primeiro trecho do e-mail com inicial maiúscula. |
| Foto | Galeria, recorte/conversão, multipart Expo File, leitura autenticada, atualização de cache e remoção persistida. |
| Preferências | Nome, idioma, tema e destaque salvos por conta na API. |
| Idioma | Português, inglês ou dispositivo; catálogo, perguntas, alternativas e feedback acompanham a seleção. Conteúdo personalizado sem tradução completa volta a português. |
| Aparência | Quatro temas escuros e seis destaques com contraste verificado. |
| Capas | PNGs originais da API ou URL HTTPS definida pelo ADMIN; falha não bloqueia o quiz. |
| Dificuldade | Fácil 30 s, médio 20 s, difícil 12 s; relógio atualizado ao voltar do segundo plano. |
| Pontuação | API corrige por IDs; 10/20/30 por acerto; XP considera o melhor resultado de cada quiz. |
| Favoritos | Persistidos por conta; falha de favoritos não impede carregar o perfil. |
| Google | SDK sob demanda; exige binário nativo e OAuth configurado. Expo Go não oferece esse módulo. |

O cronômetro é uma regra de interface, sem fiscalização de tempo no servidor ou bônus de velocidade. Rodada sem respostas não gera score. O catálogo inicial contém oito quizzes com 16 perguntas cada, em português e inglês.

## Verificar

```powershell
npm.cmd run lint -- --no-cache
npm.cmd test
npm.cmd run typecheck
node scripts/check-apk.cjs --config-only
```

Esta revisão passou nos **36 testes**, lint, TypeScript e exportação web. O guia detalha a verificação integrada e as etapas que dependem do deploy e dos celulares.

## Gerar APK

Após publicar e testar a API compatível, entre na conta Expo com acesso ao projeto existente:

```powershell
npm.cmd run expo:login
npm.cmd run expo:whoami
npm.cmd run build:apk:final
```

O perfil `final` gera APK interno e incrementa o versionCode remoto. Projeto, pacote Android e assinatura existentes foram preservados. O EAS informa o link de download ao concluir. Não foi gerado um APK novo nesta revisão; o novo ícone ainda depende de aprovação. Alterações de ícone exigem reconstruir e reinstalar o APK.