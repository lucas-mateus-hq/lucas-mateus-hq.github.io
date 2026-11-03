# Migração de formulários para Tally (3/11/2026)

**Estado:** implementação preparada na branch de migração. Não foi publicada nem ativada. O serviço Cloudflare/D1 histórico permanece intacto até confirmação do recebimento pelo Tally e autorização de desativação.

## Arquitetura e limites

- GitHub Pages / Astro: apresenta as ofertas e incorpora formulários do Tally somente após aprovação explícita do proprietário.
- Tally Free: quatro formulários publicados (dois fluxos: aulas e simulação; versões PT-BR e EN-US), notificações ao proprietário e opção de integração com uma planilha privada no Google Sheets. Verificar política de uso justo do Tally.
- Tally é o controlador técnico do envio e da confirmação visual. O site **não** declara recebimento por conta própria e nunca manipula respostas no GitHub.
- Nenhum backend novo, banco ou captcha próprio no site. O Tally pode ter verificação contra spam; não adicionar scripts da Cloudflare ao Astro.
- O site continua mostrando `Agendamento online em preparação` sem os quatro IDs aprovados.
- O código antigo `backend/lesson-intake/`, seus testes e configurações históricas ficam preservados para reconciliação e possível desativação futura. Não excluir D1 nem Worker com dados.

## Criar formulários no Tally

Acesse <https://tally.so/> no navegador autenticado do titular. Use o plano Free. O Tally oferece criação assistida por IA para agilizar: <https://tally.so/help/free-ai-form-builder>. Crie os dois formulários PT-BR abaixo. Depois **duplique** cada um e adapte manualmente/por IA a versão em inglês americano. São quatro URLs diferentes; os textos customizados não são traduzidos pelo ajuste de idioma do Tally.

### Aulas, português

Título: **Consulta sobre aulas de inglês**.

Campos: 
1. Nome (texto curto, obrigatório, até 80 caracteres).
2. E-mail para resposta (tipo e-mail, obrigatório).
3. Objetivo (única escolha, obrigatório): Preparação para entrevista; Inglês para o trabalho; As duas opções; Ainda não sei.
4. Como descreve sua fala em inglês hoje? (única escolha, obrigatório): Estou começando ou retomando o básico; Consigo responder com frases simples; Consigo conversar, mas preciso de apoio; Converso com facilidade e quero trabalhar situações específicas; Ainda não sei descrever.
5. Para quando precisa se preparar? (única escolha, obrigatório): Nos próximos 7 dias; No próximo mês; Mais adiante; Ainda estou pesquisando.
6. Qual situação deseja trabalhar? (parágrafo obrigatório, 10 a 800 caracteres).
7. Dias, horários e fuso horário disponíveis (texto curto, opcional).
8. Checkbox obrigatório, não pré-marcado: "Concordo com o uso destas informações apenas para avaliar e responder à minha solicitação. Li o aviso de privacidade disponível no site." Inclua link para `https://lucas-mateus-hq.github.io/privacidade/`.

Texto de contexto: "Este é um primeiro contato, não uma reserva ou teste de inglês. Não envie currículo, documentos ou informações sensíveis."

### Simulação, português

Título: **Solicitar simulação de entrevista em inglês**.

Campos:
1. Nome (obrigatório).
2. E-mail para resposta (obrigatório).
3. Cargo pretendido (obrigatório, até 90 caracteres).
4. Disponibilidade, com fuso horário (obrigatório, até 160 caracteres).
5. O que deseja praticar? (observações opcionais, até 320 caracteres).
6. Checkbox obrigatório, não pré-marcado: "Concordo com o uso destas informações para responder sobre minha simulação. Li o aviso de privacidade disponível no site." Inclua o mesmo link de privacidade.

Introdução: "Sessão individual de 60 minutos, R$ 80, com relatório por e-mail em até 2 horas após a sessão. Este formulário serve para solicitar um contato. Horário e pagamento serão combinados posteriormente."

### English lessons, en-US

Title: **Ask about English lessons**.

Fields: name (required), reply email (required), goal (job interview preparation / English at work / both / unsure), speaking self-description (starting or returning / short simple answers / can hold a conversation but need support / comfortable and working on specific situations / unsure), time frame (next 7 days / next month / later / exploring), situation to work on (required long text, 10–800 characters), availability and time zone (optional). Required unchecked consent: "I agree that this information will be used only to assess and respond to my inquiry. I have read the privacy notice on the website." Link to `https://lucas-mateus-hq.github.io/privacy/`. No documents, résumé, sensitive data or marketing signup.

### Mock interview, en-US

Title: **Request a mock interview in English**.

Fields: name, email, target role, availability/time zone (all required); optional notes (up to 320 characters); same required privacy consent with EN privacy link. Introduction: "One 60-minute live session, R$ 80, with a written report by email within 2 hours of the session. This is an inquiry, not a booking or payment."

### Configuração em cada formulário

- Idioma padrão correto em Settings: `Portuguese (Brazil)` ou `English`.
- Ativar reCAPTCHA no Tally se disponível; limitar spam sem cobrar ou bloquear visitantes desnecessariamente.
- **Self email notifications**: ativar para a conta do titular. Usar conta pessoal autenticada, não incluir endereço de destino em código público.
- Opcional, recomendado: integrar cada formulário a **Google Sheets privado**, uma planilha com abas distintas por serviço/idioma, ou uma planilha por formulário. Não tornar planilha pública nem copiar respostas para o repositório.
- Mensagem de confirmação do Tally: "Solicitação registrada. Vou responder por e-mail conforme disponibilidade. Nenhuma sessão foi agendada ou paga." / "Request recorded. I'll reply by email subject to availability. No session has been booked or paid for."
- Não afirmar "recebido" no site Astro; somente a confirmação do Tally após o envio real.
- Sem anúncios, pixel, automação paga, WhatsApp ou notificações para o cliente sem necessidade.

## Validação no provedor (antes de ativar)

Para cada um dos quatro formulários publicados, enviar **uma resposta sintética** usando um e-mail de teste controlado; confirmar no painel do Tally a resposta e a notificação por e-mail, e a linha na planilha privada se integração foi habilitada. Verificar em desktop e mobile, textos, consentimento, link de privacidade e finalização. Excluir respostas sintéticas posteriormente. Registrar apenas status de sucesso e IDs no histórico privado, **nunca** nomes/e-mails/respostas ou tokens no GitHub.

**Importante:** os testes automatizados deste PR usam IDs falsos e uma página simulada. Não são evidência de Tally real.

## Configuração do GitHub Actions

Após os quatro testes reais, adicionar em **Settings → Secrets and variables → Actions → Variables** deste repositório:

| Variável | Valor |
| --- | --- |
| `TALLY_LESSON_PT_ID` | ID da URL `https://tally.so/r/<ID>` para aulas PT |
| `TALLY_LESSON_EN_ID` | ID de aulas EN |
| `TALLY_MOCK_PT_ID` | ID de simulação PT |
| `TALLY_MOCK_EN_ID` | ID de simulação EN |
| `TALLY_INTAKE_APPROVED` | `true` somente após verificação real e consentimento do proprietário para publicar |

Deixe `TALLY_INTAKE_APPROVED` ausente ou `false` durante o preparo. Não usar os IDs sintéticos de CI (`Ab1001`, `Ef1003`, `Cd1002`, `Gh1004`) em produção.

O deploy exige os quatro IDs válidos e distintos quando aprovado; com flag ausente, **não** incorpora nenhum Tally. O teste de publicação verifica a presença/ausência do embed e o link externo, mas não comprova notificação nem envio real.

Depois que a PR for aprovada, integrada e a publicação com IDs reais autorizada, repetir uma submissão pequena pelo **embed na página pública** em cada idioma e serviço, conferindo Tally + e-mail + Google Sheets (quando ativo). Se falhar, definir `TALLY_INTAKE_APPROVED=false`, republicar e investigar.

## Encerramento da infraestrutura antiga

Somente depois dos testes reais e da autorização explícita para desativar serviços: verificar e exportar qualquer dado histórico relevante na D1, avaliar obrigações de retenção, desativar o Worker/Turnstile e retirar variáveis antigas do GitHub. Não excluir serviços, bancos, recibos nem históricos automaticamente. O Cloudflare pode continuar sendo usado por **outras partes do site** sem relação com esses formulários.

Referências oficiais:
- https://tally.so/help/embed-your-form
- https://tally.so/help/free-ai-form-builder
- https://tally.so/help/self-email-notifications
- https://tally.so/help/google-sheets-integration
- https://tally.so/help/supported-languages
- https://tally.so/help/gdpr
