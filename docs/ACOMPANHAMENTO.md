# AnimeQuiz — acompanhamento atual
Atualizado em 19/11/2026. Guia completo: [REVISAO_FINAL.md](REVISAO_FINAL.md).

| Pedido | Estado |
|---|---|
| Recuperar a estética anterior | Paleta, degradê, tipografia, espaçamentos e botões restaurados pelo histórico 6eee26e |
| Remover a escolha de API no aplicativo | Seletor/provider removidos; contrato 1 interno; sem versão no cabeçalho do quiz |
| Corrigir inicialização no Android | Google com carga sob demanda e guarda do módulo nativo, cinco testes específicos; launcher nativo com seleção de JDK válido |
| Ícone próprio no celular | Assets AnimeQuiz aplicados e recursos Android gerados/conferidos; requer instalar um APK novo |
| API v1 com Swagger padrão | Entradas públicas redirecionam ao Swagger; V1 inicial; sem CSS/página customizados |
| Descrever erros HTTP | APIError, exemplos e códigos reais conferidos em testes OpenAPI |
| Commits | Separados por escopo; push depende de acesso ao GitHub |
| APK final | Ainda sem binário assinado: Expo API e distribuição Gradle inacessíveis por DNS neste ambiente |

Validação: 17 testes mobile, lint completo, typecheck, exportações Android/web, prebuild e autolinking Google aprovados. API: 297 testes aprovados. Expo Doctor: 19/21, com duas consultas remotas bloqueadas.

O lockfile foi atualizado e confere com package.json; o bloqueio antigo de módulos ausentes foi resolvido. Google/Resend reais, banco durável na hospedagem, API pública e validação nos dois celulares continuam etapas externas descritas no guia.

Os registros de ENTREGA_ATUAL.md e ETAPA1_APK.md são históricos. A revisão atual remove o seletor antes preservado e recupera a estética anterior; não volta a usar dados simulados de perfil/favoritos.
