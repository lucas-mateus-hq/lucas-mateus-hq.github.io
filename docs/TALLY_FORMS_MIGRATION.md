# Aplicação do acompanhamento: Tally

Estado: implementação local; **integração/recebimento real NOT_EXECUTED**. Este é o runbook vigente, substituindo aulas, sessão avulsa e ativação Worker/Formspree. Fonte de reutilização: PR #15, commit `c920865d26c061ebf42757c26805e4c9a9acd49d`. Oferta e visual: W1/W2 atuais no Drive, com correção de Luke nesta sessão para manter a retirada do Cloudflare.

## O que muda

Dois formulários localizados do mesmo pacote substituem os quatro formulários de aulas/simulação propostos no PR #15. O site só monta um iframe do Tally após aprovação de recebimento e dois IDs válidos/distintos. O iframe usa `src` nativo, funciona sem JavaScript no site e tem link externo permanente. Não depende de script de embed dinâmico. Não encaminha query strings, fragmentos, e-mail ou conteúdo do visitante em parâmetros; referrerpolicy=no-referrer. Os formulários são administrados no Tally, não no GitHub.

Removidos os componentes/scripts antigos de aulas, formulário Worker e Turnstile do código ativo. Histórico permanece no Git; Worker/migrações/testes SQL permanecem em backend. Nenhuma mutação na conta Cloudflare, D1 ou dados. O check externo Workers Builds continua sendo uma pendência da integração Git na conta Cloudflare; não constitui dependência funcional do Pages/Tally.

## Contrato dos dois formulários reais

Criar/configurar na conta existente do titular, sem contratar plano ou criar conta nova nesta missão. Um formulário em PT-BR e outro em inglês americano:

| Campo | PT-BR | English | Regra |
| --- | --- | --- | --- |
| name | Nome | Name | Obrigatório |
| email | E-mail | Email | Obrigatório, tipo e-mail |
| currentRole | Cargo atual | Current role | Obrigatório |
| availability | Disponibilidade e fuso | Availability and time zone | Obrigatório |
| resumeUrl | Link do currículo ou perfil profissional | Résumé or professional profile link | Obrigatório, HTTPS; acesso só ao necessário |
| experienceSummary | Resumo da experiência | Brief experience summary | Obrigatório, texto curto |
| jobDescription | Descritivo de vaga real ou hipotética: texto ou link | Real or hypothetical job description: text or link | Obrigatório |
| interviewDate | Data da entrevista, se já marcada | Interview date, if scheduled | Opcional |
| privacyAcknowledged | Li como os dados serão usados para avaliar minha aplicação e responder por e-mail | I understand how my data will be used to review and respond to my application | Obrigatório, link do aviso PT/EN |

Currículo usa **link + resumo**, sem upload neste candidato; não depende de capacidade do antigo Worker nem transfere arquivos para ele. Não alterar esse contrato para upload sem verificar a conta real e atualizar o aviso de privacidade. Nunca pedir documento de identidade, endereço residencial, segredos ou documentos confidenciais de empregadores. Vaga hipotética é aceita.

Mensagem de confirmação, nos dois idiomas: aplicação recebida para avaliação; aguarde resposta por e-mail; não é reserva, aprovação, pagamento ou garantia de resultado. Não prometer resposta automática ao candidato ou prazo de aprovação não definido pelo titular.

## Ativação real ainda pendente

1. Conferir os dois formulários na conta Tally, idiomas, campos, aviso, confirmação e acesso de Lucas. Não colocar conta, tokens ou respostas no repositório.
2. Habilitar Self email notifications para o destinatário real. Não habilitar exportação Sheets ou inscrição em marketing nesta missão.
3. Enviar dados **sintéticos** em PT e EN. Verificar resposta no painel e chegada da notificação na caixa de entrada. Confirmar que currículo/vaga estão acessíveis a Lucas sem tornar documentos pessoais de clientes públicos. Registrar apenas ID do formulário, data, IDs das respostas sanitizados e resultado; não registrar conteúdo privado.
4. Conferir aparência e uso no celular e teclado, link direto e estado de confirmação. Um iframe HTTP 200 não prova recebimento.
5. Só com a evidência real, configurar as variáveis públicas de build: `PUBLIC_TALLY_INTERVIEW_PT_ID`, `PUBLIC_TALLY_INTERVIEW_EN_ID`, `PUBLIC_TALLY_INTAKE_APPROVED=true`. No GitHub, os nomes correspondentes são `TALLY_INTERVIEW_PT_ID`, `TALLY_INTERVIEW_EN_ID`, `TALLY_INTAKE_APPROVED`. O script `node scripts/check-tally-release.mjs` rejeita ausências, colisões e IDs sintéticos conhecidos; não verifica o conteúdo do provedor.
6. Aprovação expressa de Luke para o merge/publicação conjunta. Verificar o SHA publicado e repetir envio sintético na produção, distinguindo recebimento no Tally de notificação por e-mail. Revisar/excluir respostas de teste.

Sem esses dados, o build permanece utilizável para revisão e mostra aplicações indisponíveis. **Não chamar esse estado de lançamento comercial concluído.** Sem custos adicionais autorizados.

## Analytics: reutilização do PR #18

Código reutilizado do head `16318b36b46d36237fdf9ba2259835d91a311940`. Nenhuma segunda instalação ou GTM. O componente só é renderizado com `PUBLIC_ANALYTICS_APPROVED=true` (no GitHub: `ANALYTICS_CONFIG_VERIFIED=true`). Antes de ativar: confirmar Enhanced measurement desligado no stream GA4, rever destino e privacidade, conferir aceite/recusa/revogação em navegador. Só depois da publicação verificar recebimento no GA4. Não medir conteúdo de respostas, currículo ou vaga. Não atribuir conversão de aplicação a page_view ou simples clique.

## Fontes oficiais verificadas nesta sessão

- https://tally.so/help/embed-your-form
- https://tally.so/help/self-email-notifications
- https://tally.so/help/input-blocks
- https://tally.so/help/privacy-policy

A capacidade de conta, a gratuidade aplicável e a entrega reais permanecem não verificadas. Documentação pública descreve o recurso; não comprova sua configuração na conta de Lucas.
