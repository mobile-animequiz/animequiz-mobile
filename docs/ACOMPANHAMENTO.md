# AnimeQuiz: acompanhamento da entrega

Atualizado em 19/11/2026. A etapa inicial do APK está preparada, mas ainda depende do build e da instalação. As funcionalidades abaixo continuam pendentes; este documento não equivale à sua implementação.

## Base e evidências

- Cópias atuais lidas de `C:\Users\Isaac\animequiz-mobile` e `C:\Users\Isaac\animequiz-api`, incluindo histórico Git. Referências iniciais: mobile `6eee26e`; API `fb26078`.
- Mobile: Expo SDK 57, React 19.2, React Native 0.86, JavaScript e Expo Router. Regras de `AGENTS.md` examinadas. Não há projetos nativos gerenciados manualmente nesta base.
- API: Spring Boot 3.3.2, Java 17, JPA, Spring Security/JWT, Springdoc e H2 em memória. Isso é diferente do projeto de estudo Node/Prisma chamado Anime-API.
- Inspeção visual anterior: o perfil abriu no emulador, com dados de XP e estatísticas. Isso não validou um APK nem as funcionalidades ainda simuladas.
- Não houve push, publicação da API ou modificação das pastas originais nesta revisão. Nenhum segredo foi incluído nos novos arquivos.

## Requisitos e situação

| Etapa | O que existe | O que falta / critério de conclusão |
|---|---|---|
| APK atual | Perfil interno `preview`; novo perfil `current`, origem HTTPS e preflight local | Login/autorização Expo, dependências instaladas, configuração nativa e bundle validados, build concluído, link real e instalação no celular |
| Visual e movimento | Tema escuro, gradientes, splash, cronômetro e tela de resultado | Nova paleta, feedback de resposta, transições e progresso; preferência de movimento reduzido; validação de fluidez e legibilidade no aparelho |
| Marca | Arquivos PNG referenciados por `app.json` | O ícone principal atual é o placeholder do Expo. Aplicar a logo oficial aprovada a ícone, adaptativo, monocromático, favicon e splash; conferir recorte em launcher real |
| Nome e foto | A API já tem avatarUrl/bio no modelo; o app consulta estatísticas | Atualização do próprio nome, seleção da galeria, upload real, validação de tamanho/tipo, retorno consistente e sincronização após reinstalação/outro dispositivo |
| Aparência individual | Paleta global fixa | Preferências por usuário para tema e destaque, independentes da marca oficial; restauração ao entrar e feedback ao salvar |
| Google | Botões visíveis; função lança erro de integração indisponível | OAuth nativo, verificação de identidade na API e emissão de sessão; tratar e-mails existentes sem vincular contas só porque o e-mail coincide |
| Cadastro branco | O botão branco da Welcome tem rótulo Google, mas abre cadastro por e-mail | Corrigir/remover essa referência a Google preservando um acesso claro ao cadastro e ajustando o espaçamento |
| Senha visível | Dois controles de olho no mesmo campo | Um controle acessível por campo, estado e ícone consistentes, animação respeitando movimento reduzido |
| Recuperação | Tela e validação parcial de e-mail; serviço lança erro | Envio real, token aleatório armazenado como hash, prazo, uso único, troca de senha, expiração/reutilização, resposta genérica e limites de abuso |
| Idioma | Mistura de inglês e português em telas e validações | Catálogos pt-BR e fallback, escolha automática/dispositivo e seleção persistida; cobrir acessibilidade e erros. O idioma das perguntas precisa de identificação própria |
| Catálogo | Seed com 2 quizzes e 6 perguntas; imagens externas sem comprovação de autorização | Proposta abaixo, revisão factual, alternativas coerentes, identificação de dificuldade e publicação idempotente sem quebrar tentativas anteriores |
| Favoritos | Lista e remoção no perfil usam MOCK_USER_FAVORITES/MOCK_QUIZZES e estado local | Relação por usuário na API, inclusão/remoção idempotente, lista Meus favoritos, estado nas telas e sincronização entre dispositivos |
| API v1 visual | Swagger customizado com CSS, fonte externa e vídeo | Restaurar Swagger padrão preservando endpoints/contratos. Histórico: `e5805bc` introduziu docs.html estilizado; seu pai tinha a configuração padrão de Swagger |
| OpenAPI | Anotações de operações, JWT e parte dos erros | Revisar contratos reais, exemplos, permissões, validações, paginação e novos endpoints. Documentar só o que foi implementado e testado |
| Rate limiting | Filtro global por IP, janela fixa, padrão 120 requisições/60 s por processo | Limites próprios de autenticação e recuperação; avaliar proxy/IP confiável e múltiplas instâncias; validar 429, Retry-After e cabeçalhos antes de documentar a nova proteção |
| Entrega final | Testes de serviços existentes | Fluxos completos mobile/API, falha de rede, sessão expirada, persistência, APK final e instalação real |

## Banco e compatibilidade

O datasource atual é `jdbc:h2:mem:animequizdb`. Os dados desaparecem quando o processo reinicia. A persistência entre dispositivos e após reinício exige banco durável e uma estratégia de migrações/seed; adicionar campos ou favoritos em memória não atende o requisito.

O arquivo `data.sql` é executado sempre e contém inserts de dados de demonstração. Ele precisa ser separado do provisionamento de produção antes de trocar para banco persistente, evitando duplicações e inconsistência de IDs. Os quizzes existentes têm tentativas e pontuação por dificuldade; a expansão deve manter identificadores existentes e preservar os snapshots/estatísticas das tentativas anteriores.

O endpoint usado pelo app para perfil (`GET /users/{userId}/profile`) é somente leitura. A função mobile de atualização aponta para um PUT nesse caminho, mas o controller correspondente não o implementa. Não basta habilitar o formulário sem criar e proteger o contrato na API.

## Proposta inicial de catálogo, ainda não cadastrada

Proponho **8 quizzes com 15 perguntas cada: 120 perguntas no total**, incluindo a expansão dos dois quizzes atuais. Para manter a dificuldade coerente com a pontuação existente, cada quiz terá uma classificação definida; mudanças por pergunta exigiriam alterar formalmente a regra de pontos.

| Anime | Público/dificuldade inicial | Quantidade |
|---|---|---:|
| Naruto | Introdutório, fácil | 15 |
| One Piece | Conhecimentos gerais, médio | 15 |
| Dragon Ball | Introdutório, fácil | 15 |
| Demon Slayer | Conhecimentos gerais, médio | 15 |
| My Hero Academia | Introdutório, fácil | 15 |
| Fullmetal Alchemist: Brotherhood | Conhecimentos gerais, médio | 15 |
| Attack on Titan | Conhecimentos gerais, médio | 15 |
| Death Note | Conhecimentos gerais, médio | 15 |

Cada pergunta deve ter quatro alternativas, uma resposta correta, referência factual verificável e revisão de duplicatas. Delimitar arcos/temporadas e avisar spoilers. O lote inicial pode ser apenas textual: imagens só serão usadas com licença ou autorização verificável, sem hotlinks a lojas de pôsteres. A quantidade e a seleção são uma proposta para a etapa seguinte, não conteúdo já aprovado ou publicado.

## Configurações externas necessárias nas próximas etapas

| Serviço | Dados/decisões necessários | Onde manter segredos |
|---|---|---|
| Expo/EAS | Conta autorizada no projectId existente, assinatura Android e identificação de cada build | Login na CLI e serviço de credenciais Expo |
| Google OAuth | Projeto Google, tela de consentimento/testadores, cliente Android com pacote com.sn6team.animequiz e SHA-1 da assinatura usada, cliente/audience adequado à verificação da API; cliente web se houver web | IDs de cliente podem ser públicos; qualquer segredo fica exclusivamente na configuração do backend |
| E-mail | Provedor, remetente verificado, domínio/URLs públicas, SMTP ou API transacional e credenciais | Variáveis privadas do backend; nunca EXPO_PUBLIC_* |
| Avatares | Provedor de arquivos, bucket/pasta, limites de tamanho/tipo e política de acesso | Segredos de armazenamento no backend |
| Banco durável | Banco, URL/usuário/senha/TLS, backups e estratégia de migração | Variáveis privadas da API |
| Links de redefinição | Origem HTTPS pública e rota que abre o app ou permite concluir pela web | Token temporário no link; apenas hash persistido no banco; sem tokens em logs |

Os nomes de novas variáveis/endpoints serão definidos com a implementação. Esta tabela não afirma que Google, SMTP ou upload já estejam integrados. As variáveis existentes incluem JWT_SECRET, CORS_ALLOWED_ORIGINS, RATE_LIMIT_REQUESTS e RATE_LIMIT_WINDOW_SECONDS.

## Ordem de execução

1. Concluir APK atual e teste no celular, conforme ETAPA1_APK.md.
2. Preparar persistência e contratos de perfil/preferências/favoritos, com autorização por proprietário e testes da API.
3. Implementar Google e recuperação segura, com limites próprios e os serviços externos configurados.
4. Integrar perfil/favoritos, idioma e aparência individual no mobile; atualizar marca e animações acessíveis.
5. Revisar e publicar catálogo aprovado; restaurar visual da documentação v1 e completar OpenAPI.
6. Executar a matriz de aceitação e gerar o APK final. Exibição/troca de versão dentro do APK fica fora das novas melhorias desta entrega.

## Validação já executada nesta etapa

- `npm test`: **6 testes aprovados**, zero falhas. Exercitam versionamento HTTP, paginação/contratos de questões, idempotência no envio, invalidação de sessão expirada, erro de conexão e cronômetro após background.
- Preflight offline: configuração e arquivos PNG aprovados; manifesto/lockfile compatíveis.
- Preflight online: interrompido com `ENOTFOUND`; API pública não validada por rede.
- Download/execução da CLI EAS: bloqueado por DNS do ambiente. Nenhuma tarefa de build foi criada.
- Lint com a configuração Expo nos arquivos alterados e no script novo: aprovado. Após a instalação completa de dependências pelo usuário, `npm run lint` voltou a executar normalmente e confirmou 10 erros preexistentes em useHomeData, useProfileData, useSplashAnimation e QuizScreen (set-state-in-effect/refs). Não foi declarado lint completo aprovado.
- Configurações inválidas: o preflight rejeitou override de URL local e de versão incompatível com o perfil current. `node --check` do script e `git diff --check` aprovados.
- `tsc --noEmit`: sem projeto TypeScript configurado; mostrou ajuda e saiu com código 1. Não houve checagem de tipos concluída.
- `expo config --type public --json`: aprovado com as dependências instaladas na própria cópia; o plugin de splash resolveu normalmente.
- `expo export --platform android --max-workers 1`: aprovado, com 1.326 módulos, 34 assets e bundle Hermes de aproximadamente 2,9 MB. É uma exportação do bundle, não um APK nativo.
- O usuário concluiu `npm ci`. O login EAS foi cancelado ao receber o próximo comando na pergunta de confirmação de instalação npm. Foram adicionados `expo:login`/`expo:whoami` e `--yes` às invocações npx da CLI, para eliminar essa confirmação de instalação. Login e build continuam etapas separadas e interativas.
- A API não foi alterada nesta etapa; a suíte Java não foi repetida. Os 283 testes históricos da revisão anterior não substituem uma nova execução depois das próximas mudanças.

O APK, as permissões do manifesto nativo gerado e a validação de interface no celular continuam pendentes. O bundle Android já foi exportado.
