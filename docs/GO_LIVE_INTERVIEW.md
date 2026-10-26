# Simulação de entrevista — publicação segura (26/10/2026)

**Escopo comercial:** 60 minutos · R$ 80 · relatório individual por e-mail em até duas horas após a sessão. O relatório é feito/revisado pelo responsável; não existe bot de transcrição, envio automático nem pagamento integrado.

## O que já está implementado

- Página PT-BR e EN-US e formulário direto no próprio site (nome, e-mail, cargo, disponibilidade; notas opcionais).
- Endpoint privado de recebimento existente em `backend/lesson-intake/worker.mjs`, com Turnstile obrigatório, controles de origem, validação e base D1 privada.
- Resposta da página só diz **recebido** depois de confirmação do endpoint com protocolo; falhas preservam dados para retentativa, sem fingir envio.
- Testes sintéticos de navegador, de payload/SQL, estáticos e de responsividade no CI. **Nenhum teste sintético é prova de produção.**
- No build sem provedor ativo, nenhuma ficha de contato é exibida; uma mensagem diz que pedidos online ainda não são aceitos. Não redirecionar candidatos obrigatoriamente ao LinkedIn.

## O que impede o lançamento nesta conversa

**Não há uma conexão Cloudflare autorizada disponível nesta sessão.** Não é possível criar a base D1, ativar Turnstile, configurar a chave secreta no Cloudflare ou comprovar armazenamento real usando apenas o acesso ao GitHub. Não solicitar que o responsável cole chaves no chat ou em issues. **Nenhuma transação paga ou upgrade é autorizado.**

A PR pode ser integrada em `main` após CI, mas o job `deploy` **não publicará a nova página** enquanto a variável `INTAKE_RELEASE_APPROVED` não for `true` e as variáveis públicas do formulário não estiverem presentes. O site publicado anteriormente permanece no ar.

## Ativação única no Cloudflare Free (operador autenticado)

1. Entrar em <https://dash.cloudflare.com/> com a conta do responsável e conferir **Workers Free / D1 Free**; não cadastrar plano pago por iniciativa do agente. Criar D1 privada `lucas-lessons-intake` e Worker `lucas-lessons-intake` com fonte `backend/lesson-intake/worker.mjs`.
2. Usar `backend/lesson-intake/wrangler.example.toml` como modelo local para `wrangler.toml`, com o **ID real de D1**; aplicar `migrations/0001_intake.sql`. Fazer bind da D1 como `LEADS_DB`. Definir `INTAKE_ENABLED="true"`, `WHATSAPP_COST_POLICY="zero"`, `WHATSAPP_ENABLED="false"`, `WHATSAPP_BILLING_APPROVED="false"`. Manter as credenciais privadas fora do repositório.
3. Criar widget Turnstile para hostname **`lucas-mateus-hq.github.io`**. Definir **`TURNSTILE_SECRET_KEY` como Worker Secret**, não variável de site. A action precisa ser `lesson_intake`, como já codificada. Nenhum envio via WhatsApp está implementado/ativado para esta oferta.
4. Executar verificações autenticadas: Worker responde OPTIONS (204) e POST malformado (400, não 503); D1 permite leitura privada, e a chave Turnstile está presente. Não inventar confirmação de uma inscrição real.
5. Em GitHub → repositório pessoal → Settings → Secrets and variables → Actions → **Variables**, configurar:
   - `PUBLIC_LESSON_API_URL`: URL HTTPS exata do Worker terminada em `/v1/lesson-requests`;
   - `PUBLIC_TURNSTILE_SITE_KEY`: chave pública real do widget;
   - `INTAKE_RELEASE_APPROVED`: `true`, **somente depois das verificações anteriores**.
6. GitHub → Actions → `Publish personal home to GitHub Pages` → Run workflow, branch `main`. O job `deploy` executa `scripts/check-intake-release.mjs` antes de construir/publicar; falha de configuração, CORS, serviço indisponível ou chave sintética impede o deploy.
7. **Smoke test imediatamente após publicação**: em https://lucas-mateus-hq.github.io/ preencher formulário PT-BR com dados sintéticos de teste e Turnstile real; confirmar protocolo no navegador e **registro privado correspondente na D1**. Testar versão EN-US e estado de erro sem guardar dados reais em GitHub. Apagar o registro sintético após confirmação. Verificar também recebimento de um pedido real somente quando houver consentimento e necessidade, sem expor conteúdo em logs públicos.
8. Se não persistir pedido real, retirar a ativação ou restaurar a última publicação funcional antes de divulgar o link. Não considerar o serviço vendável só por CI verde, página acessível ou prévia.

## Gates explícitos para fechamento

- [ ] Worker/D1 reais ativos na conta **Free**, sem upgrade.
- [ ] Turnstile em `lucas-mateus-hq.github.io` e Worker Secret verificados.
- [ ] GitHub Variables de publicação configuradas e release gate aprovado.
- [ ] Deploy GitHub Pages confirmado no commit mergeado.
- [ ] Pedido sintético PT e EN recebido, persistido e acessível apenas ao responsável.
- [ ] Valor, duração, prazo e condições claros; verificação mobile/desktop.
- [ ] Link público divulgado somente após todos os itens acima.

**Não há como marcar esses gates de produção como concluídos antes de observar os serviços reais.** O backend guarda pedidos mas **não envia notificação automática**; o responsável deverá consultar D1 privada regularmente até decidir e implementar um aviso seguro.
