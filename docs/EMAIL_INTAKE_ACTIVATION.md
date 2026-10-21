# Solicitações por e-mail: alternativa vigente ao WhatsApp

Decisão do Founder, 21/10/2026: receber as solicitações por e-mail agora;
reavaliar WhatsApp quando houver condições de acesso e custo. **Teto R$ 0.**

## O que foi preparado

O formulário PT/EN existente é reaproveitado em um modo de POST HTML nativo
para um endpoint opaco do Formspree. Funciona sem JavaScript, não publica o
e-mail de destino ou telefone e não depende de Meta, Worker, D1 ou Turnstile.
O visitante é avisado de que seguirá para a verificação/confirmação do provedor.
Não há auto-resposta, anexos, CC, marketing ou pagamento. O plano não é uma
credencial: verificar o Free no painel é uma obrigação de ativação.

Os modos Worker e e-mail são mutuamente exclusivos. Selecionar e-mail com
configuração incompleta deixa a coleta inativa; não há fallback silencioso.
A política de privacidade acompanha o modo realmente selecionado. O backend
anterior é preservado, com WhatsApp bloqueado pela política de R$ 0.

## Ativação: uma conta gratuita e confirmação do destinatário

1. O titular cria ou acessa uma conta em https://formspree.io/register no plano
   **Free**, sem cartão, upgrade ou trial pago. Ele aceita os termos e confirma
   o e-mail diretamente no provedor. Não compartilhar senha, link de login ou
   código de verificação no chat. A integração do site só precisa do ID público
   do formulário, não de API key nem acesso à conta de e-mail.
2. Criar um formulário `Aulas de inglês | Lucas Mateus`, com envio para o e-mail
   confirmado. Conferir destinatário, notificações ativas, filtro antispam e
   proteção CAPTCHA do próprio serviço. Restringir o domínio a
   `lucas-mateus-hq.github.io` no painel. Não desativar verificações para fazer
   um teste passar. Não solicitar dados sensíveis ou anexos.
3. Copiar somente o endpoint público `https://formspree.io/f/<id>`.
   O adaptador aceita IDs de oito letras minúsculas; se o provedor emitir outro
   formato, adaptar e testar a validação antes de usá-lo. Nunca usar um endpoint
   antigo que contenha o e-mail de destino.
4. Fazer uma única submissão sintética pelo formulário do candidato, configurado
   localmente com o ID real. Confirmar a página do provedor, o registro no painel
   e a mensagem efetivamente recebida no e-mail. Se houver desafio de segurança,
   o titular o conclui. Não inferir entrega apenas de HTTP 200, página de sucesso,
   teste interceptado ou presença de uma variável de configuração.
5. Só depois desse teste, configurar as **Actions variables** públicas:

   ```text
   PUBLIC_LESSON_INTAKE_MODE=email
   PUBLIC_LESSON_EMAIL_FORM_ID=<id público real>
   PUBLIC_LESSON_EMAIL_VERIFIED=true
   ```

   Publicar com o workflow existente e conferir PT/EN e privacidade. Esses valores
   são configuração pública; não usar segredos de conta, e-mail ou telefone ali.
   A flag registra a verificação do operador; não detecta entrega ou plano online.

## Custo, privacidade e operação

- Oferta consultada em 21/10/2026: Free, 50 envios/mês, até dois endereços
  vinculados e histórico de 30 dias. Sem contratação paga autorizada. O limite
  não é uma garantia de disponibilidade: excedentes podem deixar de gerar
  notificação e exigir tratamento no painel. Não fazer upgrade automaticamente.
- O Formspree recebe as respostas e dados técnicos; o Gmail recebe a mensagem.
  O provedor pode processar dados fora do Brasil. A invisibilidade do endereço no
  HTML não o oculta do provedor nem do cliente a quem Lucas responder por e-mail.
- Histórico de 30 dias não significa exclusão automática da cópia no Gmail.
  Revisar manualmente consultas sem continuidade para exclusão após 30 dias,
  considerando obrigações e eventual contratação. Atender direitos pelo LinkedIn.
- Aceitação pelo provedor, chegada na caixa e leitura são estados diferentes.
  Consultar spam e painel se uma solicitação não chegar. O LinkedIn permanece
  visível como alternativa, inclusive quando o serviço atingir o limite.
- Não há garantia de idempotência do provedor. Reenviar após uma resposta ambígua
  pode duplicar uma consulta. Não há retry automático, protocolo transacional
  próprio, webhook de entrega ou integração real com WhatsApp neste modo.
- As validações HTML ajudam o visitante, mas não são uma fronteira de segurança
  contra clientes modificados. Antispam, limites e armazenamento ficam no provedor;
  respostas recebidas são conteúdo não confiável, nunca ordens a executar.

## Evidência reproduzível

`npm run test:intake` cobre o backend anterior e a seleção de transporte.
`npm run build` e `npm run test:static` verificam a publicação padrão inativa.
O job `email-ui` configura um ID **sintético**, constrói, executa contratos estáticos
e `npm run test:email-ui` em Chromium. O endpoint é interceptado: nenhum e-mail real
é enviado e esses resultados não demonstram cadastro ou entrega no Gmail.
O job `intake-ui` preserva a regressão do Worker, também com provedores interceptados.

Antes da confirmação e teste do destinatário, os estados são:
`EMAIL_ADAPTER=IMPLEMENTED`, `PROVIDER_ACCOUNT=NOT_CONFIGURED`,
`REAL_EMAIL_DELIVERY=NOT_EXECUTED`, `PUBLIC_FORM=INACTIVE`,
`WHATSAPP_DELIVERY=NOT_EXECUTED`.

Fontes primárias consultadas:
- https://formspree.io/plans/
- https://help.formspree.io/articles/account-management/account-limits/
- https://help.formspree.io/articles/form-and-project-settings/over-limit-submissions
- https://help.formspree.io/articles/troubleshooting/unable-to-submit-form-error
- https://formspree.io/legal/privacy-policy/
- https://formspree.io/legal/terms-of-service/
