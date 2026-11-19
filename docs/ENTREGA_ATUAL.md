# AnimeQuiz — entrega atual e APK final
Atualizado em 19/11/2026.

## Estado

O APK base foi gerado e Isaac informou que estava baixando em dois celulares. As melhorias desta revisão estão no código das cópias de trabalho mobile/API, em branches próprias. O APK final desta revisão ainda não foi gerado. Não há link de download final disponível.

O ambiente de execução não resolveu registry.npmjs.org, GitHub nem a API pública por DNS. As novas dependências não puderam ser instaladas. O package.json declara as versões selecionadas pelo Expo SDK 57, mas o package-lock.json ainda é o da base anterior. Não use npm ci nesta revisão até atualizar e registrar o lockfile. Não foi criado um lockfile fictício.

## O que mudou

| Requisito | Implementação | Validação / pendência |
|---|---|---|
| APK inicial | Perfil current, preflight, conta EAS existente, APK sem Metro | Download informado pelo usuário; instalação/uso nos celulares não verificados aqui |
| Visual | Fundo azul profundo/violeta, fontes maiores, botões legíveis e alvos de toque maiores | Revisão de código; desempenho e screenshots nos celulares pendentes |
| Movimento | Entradas curtas, transição de perguntas, barra de progresso com driver nativo, resultado e olho da senha | Respeita configuração do sistema via AccessibilityInfo, inclusive mudanças; validação física pendente |
| Marca | Ícones Expo substituídos por adaptações da marca A do projeto; splash preenchido, favicon e marca da entrada legível | Arquivos PNG/ligação configurados; manifesto/launcher do novo APK pendentes |
| Perfil/foto | Nome de exibição, galeria do sistema, recorte/JPEG 512×512, upload privado e remoção | API validada; bibliotecas de galeria/manipulação e fluxo nativo pendentes |
| Aparência | midnight/eclipse e violet/cyan/rose, pessoais e sincronizados na API | Valores de API independentes das traduções |
| Idioma | PT-BR inicial, English e seguir dispositivo; fallback PT-BR | Preferência na API + cache por conta; perguntas permanecem em português |
| Google | SDK nativo, adapter web, verificação na API, sessão própria e vinculação segura | Necessita IDs OAuth e SHA-1 reais; SDK não roda no Expo Go |
| Cadastro/senha | Botão branco identificado como cadastro por e-mail; um olho animado por senha | Google removido desse botão; demais botões usam integração real |
| Esqueci a senha | Pedido genérico, envio Resend após commit, link seguro 15 min, página de nova senha, uso único e revogação de sessões | Testado com mailer substituído; envio real exige configuração externa |
| Catálogo | 8 quizzes/120 perguntas textuais e quatro alternativas; fontes no JSON da API | Importação idempotente testada; não publicado no servidor atual |
| Favoritos | Adicionar/remover, estados nos cards, “Meus favoritos”, área do perfil | Sem mocks; isolados por usuário e persistidos na API |
| API v1/Swagger | Apresentação padrão restaurada, contratos, segurança, códigos e cabeçalhos | Testes OpenAPI passaram; troca de versão no APK preservada como estava |
| Persistência | H2 em arquivo, dados pessoais/foto/favoritos duráveis | Teste de fechar/reabrir passou; hospedagem exige volume persistente |

A correção e os pontos continuam no servidor. Durante o quiz, o feedback indica seleção/resposta registrada, sem simular acerto no celular. O resultado mostra o agregado real da API. Tentativas usam a mesma chave em uma repetição para evitar pontuação duplicada.

## Configurações que dependem das contas

### API
Veja o guia docs/CONFIGURACAO_ENTREGA.md no repositório da API:
- JWT_SECRET estável e privado.
- Volume durável e DB_URL em arquivo; backup/exportação da base antiga antes da mudança.
- PUBLIC_APP_ORIGIN HTTPS servindo a página /reset-password.html.
- GOOGLE_CLIENT_IDS com o ID OAuth WEB aceito.
- MAIL_API_KEY e MAIL_FROM do Resend, com domínio/remetente verificados.
- CORS_ALLOWED_ORIGINS somente para as origens web que forem publicadas.

### Google e Expo
Pacote Android existente: com.sn6team.animequiz. Projeto Expo existente: 2ef330d1-cc20-4fc2-99c8-ec210409c626. Não foram trocados pacote/projeto/keystore.

No Google Cloud, cadastre o cliente Android com esse pacote e o SHA-1 da assinatura EAS usada no APK. Crie o cliente WEB e cadastre seu ID no backend e como EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no ambiente preview do EAS. Para desenvolvimento local, use .env.local. Esse arquivo está fora do Git e do upload EAS: configurar apenas nele não configura o build remoto.

Gerencie as variáveis preview no painel expo.dev do projeto existente. IDs OAuth são públicos; client secret, chave de e-mail, JWT_SECRET e keystore nunca vão no EXPO_PUBLIC_* nem no Git. Para iOS, a variável GOOGLE_IOS_URL_SCHEME habilita o plugin com o URL scheme próprio; iOS não foi validado nesta entrega.

A conta Expo precisa ter acesso ao projeto e às credenciais de assinatura. O APK final deve usar o mesmo certificado do APK já instalado para atualizar por cima. Não remova o aplicativo antes de tentar atualizar.

Sem configuração, Google e e-mail apresentam indisponibilidade real; a interface não finge autenticação ou envio.

## Como concluir o build

Execute um comando por linha, na pasta mobile desta cópia de trabalho:
C:\Users\Isaac\Documents\Codex\2026-11-18\sites-plugin-sites-openai-curated-remote\work\animequiz-next\mobile

1. npm.cmd run setup:next
2. npm.cmd run lint
3. npm.cmd test
4. npm.cmd run typecheck
5. npx.cmd --yes expo-doctor
6. npx.cmd --no-install expo export --platform android --max-workers 1
7. Registre o package-lock.json atualizado em commit após as verificações.
8. Publique/valide a API nova e configure os serviços externos.
9. npm.cmd run expo:whoami (ou npm.cmd run expo:login, se a sessão EAS não estiver ativa)
10. npm.cmd run build:apk:final

setup:next executa npm install para atualizar a instalação/lockfile e expo install --check para verificar a seleção SDK. As adições foram selecionadas com Expo install: image-picker ~57.0.21, image-manipulator ~57.0.22, localization ~57.0.2, react-native-web ~0.21.0 e Google Sign-In 17.0.0. Não use npm audit fix --force como etapa de build.

O perfil final herda a origem pública HTTPS e o contrato 1, usa o ambiente preview, produz APK interno e incrementa versionCode. A versão do aplicativo é 1.1.0. O preflight recusa dependências ausentes, lockfile divergente e API que não documenta os endpoints novos. A presença desses endpoints não substitui testes reais de Google/e-mail.

O comando EAS exibirá o link do build e, ao concluir, o download do APK. Esse link ainda não existe para esta revisão. Transfira/abra o APK nos dois celulares, permita instalação por esse navegador/gerenciador e confirme “Atualizar”. O aplicativo instalado deve abrir com Metro e o computador desligados. Se o Android rejeitar por assinatura diferente, obtenha o certificado original no projeto EAS antes de tentar outra distribuição.

Web é opcional: há favicon, metadados e adapters de sessão/Google/avatar. Requer react-native-web instalado, origem OAuth e CORS configurados. Exportação web desta revisão não foi validada.

## Testes executados e limites

- API: 294 testes passaram, compilação Java --release 17 e execução completa via JUnit Jupiter com dependências cacheadas. Inclui fechamento/reabertura do banco, contratos antigos/novos, pontuação de 15 perguntas, XP, favoritos, fotos, reset e documentação.
- Mobile: 12 testes de serviços passaram. Incluem V1/V2, paginação, envio de IDs, chave idempotente, 401, falha de conexão, cronômetro em background, multipart, favoritos, recuperação genérica e idiomas.
- tsc --noEmit passou com o projeto JavaScript configurado. checkJs=false: não equivale a tipagem estrita dos arquivos JS.
- Regras de código ESLint passaram quando a resolução de imports foi excluída apenas no comando diagnóstico. O lint normal continua bloqueado pelos pacotes que não puderam ser instalados; nenhuma regra foi desabilitada no repositório.
- O bundle Android exportado anteriormente era da base. A nova exportação/APK, Expo Doctor e a interface nos celulares ainda dependem da instalação das bibliotecas.
- Não foram feitos login Google real, envio real de e-mail, publicação no Render ou push confirmado para GitHub nesta etapa.

## Matriz de aceitação nos dois celulares

1. Abrir APK com computador/Metro desligados, testar Wi-Fi e dados móveis.
2. Entrar/cadastrar, fechar/reabrir; conferir sessão. Com internet desligada, conferir erro e “Tentar novamente”, sem sessão fictícia.
3. Na mesma conta nos dois celulares: alterar nome, foto, tema, cor e idioma; voltar o outro app ao primeiro plano e conferir sincronização.
4. Em contas diferentes: confirmar isolamento de favoritos, nome e foto; sair e entrar na outra conta no mesmo aparelho.
5. Galeria: escolher, cancelar, negar acesso e remover foto. Verificar carregamento, sucesso e falha de rede.
6. Favoritar/desfavoritar no catálogo e em Meus favoritos; repetir após reiniciar e após outro login.
7. Google: conta nova, cancelar, conta existente com mesmo e-mail (409), login por senha e vinculação no perfil.
8. Recuperação: e-mail cadastrado/desconhecido com mesma resposta; receber e-mail real; nova senha; link expirado/reutilizado; sessão do segundo celular revogada no próximo acesso.
9. Idioma: instalação nova PT-BR; English; seguir dispositivo; fallback PT-BR em idioma não suportado; questões continuam em português.
10. Ativar “Remover animações” no Android e conferir transições/olho/barra/resultado. Conferir tamanho de texto e leitura dos controles.
11. Quiz de 15 perguntas, quiz com tempo, segundo plano, envio, perda de conexão e repetição sem duplicar score/XP; conferir resultado real.
12. Conferir Swagger padrão e 429/Retry-After em ambiente de teste sem esgotar a API de outros usuários.

## Git

O push da API foi tentado nesta sessão e falhou com “Could not resolve host: github.com”. Não houve envio confirmado das branches. Os commits abaixo estão disponíveis localmente.

| Mobile | Escopo |
|---|---|
| 881657f | Dependências SDK 57 e perfil/preflight do APK final |
| 022d6a7 | Idiomas, preferências e serviços privados de conta |
| d76c8ec | Sessão Google, recuperação e controle único de senha |
| b2db511 | Perfil real, galeria, temas e favoritos na interface |
| b030913 | Traduções, contraste e animações com movimento reduzido |
| 8787554 | Atualização ao focar telas, isolamento de requisições e acessibilidade |
| 76ff7e7 | 12 testes dos serviços mobile |
| c487cfc | Marca A do projeto no ícone/favicons/splash; retirada dos assets Expo da configuração |

| API | Escopo |
|---|---|
| 41cdc37 | Preferências, foto e favoritos por proprietário |
| b190684 | Google verificado e recuperação por e-mail |
| 2e4ac42 | Transporte de e-mail sob demanda e teste de link expirado |
| ffb6ebe | Catálogo de 8 quizzes e 120 perguntas |
| 4c15e96 | Banco em arquivo e perfil de produção |
| ff7ba27 | Durabilidade do banco e limite defensivo de contadores |
| 050e01d | Swagger padrão e contratos novos |
| f8577e4 | Configuração, publicação e validação documentadas |

Branches de trabalho: mobile feat/android-baseline e API feat/animequiz-next. Os commits são locais até um push confirmado. Não houve merge automático na main. Para publicar as branches em um terminal com rede/autenticação:
- Na API: git push -u origin feat/animequiz-next
- No mobile: git push -u origin feat/android-baseline

Depois abra os PRs para os repositórios mobile-animequiz/animequiz-api e mobile-animequiz/animequiz-mobile. Publicar a API no Render é uma etapa distinta de criar/enviar commits.
