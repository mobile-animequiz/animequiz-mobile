# Entrega integrada — 26/11/2026

## Estrutura e correções

O Expo Router permanece em `src/app`; telas em `src/screens`, sessão e conta em `src/contexts`, HTTP em `src/services` e traduções em `src/i18n`. Utilitários de nome e mídia mantêm regras de apresentação fora da navegação.

O multipart nativo usa `File` do Expo SDK 57, preservando o boundary gerado pelo fetch. A leitura do avatar é privada: JWT em Authorization, nunca na URL. O cache considera conta, sessão e versão; a web usa blob autenticado e revoga a URL ao trocar a imagem. Há carregamento, tentativa após falha e remoção persistida. Falhas nos favoritos não interrompem o perfil.

Alterações fixam o token de quem iniciou a ação. Se a sessão mudar durante a preparação da foto, ela não será enviada com o token da conta seguinte nem aplicada ao seu estado.

## Idioma e apresentação

PT-BR é inicial; inglês e idioma do dispositivo são suportados. A preferência salva alimenta interface e `lang` no catálogo/perguntas. Traduções preservam IDs; perguntas sem tradução completa usam português integralmente. O catálogo inicial tem 128 perguntas e 512 alternativas em cada idioma.

Midnight, Eclipse, Oceano e Floresta mantêm fundos escuros. Violeta, ciano, rosa, âmbar, menta e coral ampliam os destaques. As 24 combinações tiveram contraste de texto verificado. A identidade oficial do app permanece separada das preferências pessoais.

O quiz recebe capa, idioma e tempo pela V2. Limites máximos de 30/20/12 segundos acompanham a dificuldade, inclusive após segundo plano. A API mantém 10/20/30 pontos por acerto e XP pelo melhor resultado. O relógio não é garantia antifraude no servidor.

Capas iniciais são ilustrações geométricas originais relacionadas aos temas dos animes, sem copiar personagens. Para arte específica, cadastre uma URL HTTPS autorizada no quiz. O fluxo escolhido é URL no backend e exibição no cliente; não foi acrescentado upload de arquivo de capa. Fotos pessoais usam upload autenticado separado.

## Verificação

- 36 testes Node aprovados, incluindo multipart, sessão, idioma, paginação, nome, capas, contraste e V2 fixa.
- Lint sem cache e TypeScript sem erros; exportação web concluída.
- Configuração APK validada: `com.sn6team.animequiz`, SDK 57, ícones existentes e perfil interno.
- Interface web e API local real: 23 verificações, incluindo login, perfil, inglês, tema Oceano, destaque Menta, nome, galeria, foto visível, remoção persistida, catálogo traduzido e partida completa com XP oficial.
- API: 308 testes Java e quatro testes de documentação aprovados, incluindo permissões, traduções, pontuação, multipart HTTP e seed.

Não houve instalação em celular físico nem geração de APK nesta revisão. O deploy de produção ainda precisa receber este backend. OAuth Google, e-mail e disponibilidade do Render dependem do ambiente de destino e não foram tratados como integrações externas aprovadas.

## Cópia modificada e GitHub

O mobile de Downloads foi conferido: os 129 arquivos rastreados coincidiam com o repositório após normalizar quebras de linha. A revisão usa outra árvore Git para preservar o histórico e a cópia recebida.

```powershell
Set-Location -LiteralPath 'C:\Users\Isaac\Documents\Codex\2026-11-18\sites-plugin-sites-openai-curated-remote\work\animequiz-evolution\mobile'
npm.cmd ci
npm.cmd run start:go
```

Os dois repositórios usam `feat/quiz-experience-v2`. Para enviar os commits:

```powershell
git -C 'C:\Users\Isaac\Documents\Codex\2026-11-18\sites-plugin-sites-openai-curated-remote\work\animequiz-evolution\api' push -u origin feat/quiz-experience-v2
git -C 'C:\Users\Isaac\Documents\Codex\2026-11-18\sites-plugin-sites-openai-curated-remote\work\animequiz-evolution\mobile' push -u origin feat/quiz-experience-v2
```

Abra um PR em cada repositório. Publique a API antes de distribuir este mobile: a V2 com mídia e idioma exige a revisão correspondente no servidor. O admin local não é criado no Render; o seed nunca promove uma conta USER existente.

## Ícone e APK

Os [conceitos A, B e C](ICON_CONCEPTS.md) incluem paletas e prompts de geração. Nenhum ícone/splash/favicon foi trocado. Após aprovação, gerar recursos Android e novo APK com a mesma assinatura. O README contém os comandos EAS; o build entrega o link de download quando terminar.
