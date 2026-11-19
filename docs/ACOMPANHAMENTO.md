# AnimeQuiz — acompanhamento
Atualizado em 19/11/2026. Guia operacional completo: [ENTREGA_ATUAL.md](ENTREGA_ATUAL.md).

| Etapa | Estado verificável |
|---|---|
| 1. APK inicial | Usuário informou o download nos dois celulares. A execução física não foi observada neste ambiente. |
| 2. Visual/marca/animações | Código atualizado: paleta, legibilidade, ícones próprios e splash corrigido, transições, progresso e resultado; movimento reduzido respeitado. Validação no APK novo pendente. |
| 3. Perfil/aparência | API e integração mobile implementadas, com nome, galeria, foto privada e preferências persistentes. Fluxo nativo depende das bibliotecas. |
| 4. Autenticação | Google, vinculação segura, recuperação real via Resend, reset web e revogação implementados. Credenciais e testes reais externos pendentes. Botão branco corrigido e controle único de senha. |
| 5. Idioma | PT-BR padrão, English/dispositivo, fallback PT-BR, preferência por conta. Perguntas continuam em português. |
| 6. Catálogo/favoritos | 8 quizzes × 15 = 120 perguntas, alternativas variadas, fontes e seed idempotente. Favoritos persistentes, sem mocks. Falta publicar a API. |
| 7. API/Swagger | Swagger padrão restaurado; contratos/segurança/exemplos/limites documentados e testados. Sem alteração adicional da troca de versão no APK. |
| 8. Entrega final | 294 testes API e 12 testes mobile passaram. Código checado; instalação de dependências, lockfile, build nativo, provedores e matriz física pendentes. |

## Bloqueios concretos

- ENOTFOUND ao acessar npm/GitHub/API pública pelo ambiente de execução. Novas dependências não instaladas.
- package-lock.json ainda corresponde à base; atualizar com npm run setup:next e registrar antes do build. npm ci está inadequado enquanto houver divergência.
- Normal lint ainda falha na resolução de quatro módulos ausentes. O diagnóstico de todas as demais regras passou. Nenhuma regra foi retirada da configuração.
- tsc --noEmit passou; checkJs=false, portanto não comprova tipagem estrita do JavaScript.
- Google OAuth requer ID WEB, cliente Android com pacote/SHA-1 e variável preview no EAS.
- Resend requer chave privada e remetente/domínio verificados. PUBLIC_APP_ORIGIN deve servir o reset por HTTPS.
- Backend requer deploy, volume persistente e exportação/backup da base antiga antes da troca. Nada foi publicado automaticamente.
- APK final e link de download ainda inexistentes. A exportação antiga pertence à base, não a esta revisão.

## Base e organização

Cópias de trabalho: work/animequiz-next/mobile e work/animequiz-next/api. Bases: mobile 6eee26e e API fb26078. Originais em C:\Users\Isaac\animequiz-mobile e C:\Users\Isaac\animequiz-api preservados. Expo SDK 57 / React Native 0.86; Java 17 / Spring Boot 3.3.2 / JPA / H2.

Commits foram separados por escopo nas branches feat/android-baseline e feat/animequiz-next. Commit local não equivale a push nem a deploy. Confira o relatório operacional e o histórico Git para o estado de publicação.

## Evidências

A suíte API foi compilada com --release 17 e executada com JUnit Jupiter, usando dependências cacheadas, sem os plugins Maven indisponíveis. 294 testes/zero falhas. Inclui banco em arquivo fechado/reaberto, isolamento, autenticação, contratos OpenAPI, catálogo, pontuação/XP, limites, fotos e reset. Testes Google/e-mail usam adapters substituídos, sem tráfego para provedores.

Mobile: 12 testes/zero falhas. Cobrem versões, paginação, chave idempotente, 401, erro de rede, timer, multipart, favoritos, recuperação, tradução e estabilidade dos valores de aparência em idiomas diferentes. Scripts finais impedem seguir com dependências ausentes, lockfile divergente ou backend sem contratos novos.

A validação pela interface e a medição de desempenho nos celulares seguem a matriz de ENTREGA_ATUAL.md. Nenhuma simulação de screenshot substituiu essa validação.
