# Simulação de entrevista em inglês — entrega operacional (rascunho)

Estado: **oferta em revisão, não publicada**. Preço inicial: **R$ 80**. Sessão: **60 minutos**. Entregável: **relatório individual escrito por e-mail em até 2 horas após o término da chamada**. A experiência anterior em Talent Acquisition e aulas de inglês não equivale a histórico comercial prévio de simulações; não declarar números de alunos, resultados ou satisfação inexistentes.

## Compromisso com o participante

- Reunir as informações do formulário e confirmar disponibilidade, meio de chamada, pagamento e condições antes de marcar.
- Simulação por videoconferência com perguntas contextualizadas no cargo/área, espaço para repreguntas e feedback verbal.
- Enviar um relatório escrito individual e revisado pessoalmente **em até 2 horas a partir do fim da sessão**, usando o e-mail informado. O relatório não depende de um bot para existir.
- Não apresentar avaliação de proficiência padronizada, previsão de contratação ou aprovação em processo seletivo.

## Fluxo inicial: sem bots, sem gravação

1. Antes da chamada: analisar objetivo, nível de fala autodeclarado, cargo e possíveis contextos. Preparar perguntas e critérios observáveis.
2. Durante a hora: acolhimento/contextualização (~5 min), entrevista prática (~45 min) e feedback imediato (~10 min). Tempos flexíveis; a sessão continua tendo 60 min.
3. Registrar somente **anotações pertinentes** ao objetivo do encontro e aos exemplos de resposta que sustentam o feedback, com transparência ao candidato. Não registrar documentos, informações sensíveis ou dados de recrutadores.
4. Após a chamada: montar o relatório abaixo, revisar exemplos com base no observado e encaminhar individualmente por e-mail dentro do prazo.
5. Não colocar nomes, e-mails, anotações reais ou transcrições em repositórios GitHub, PRs, logs, issues ou ferramentas públicas.

## Modelo reutilizável de relatório (1 página, personalizável)

**Simulação de entrevista em inglês — feedback individual**

**Profissional:** [nome] | **Sessão:** [data] | **Cargo-alvo:** [cargo ou área]

**Resumo executivo (2–3 frases):** [como o participante comunicou sua experiência na simulação; evidências concretas sem adjetivos genéricos].

**Pontos fortes observados**
- [comportamento observado e exemplo contextualizado]
- [comportamento observado e exemplo contextualizado]

**Três prioridades de melhoria**
1. [situação observada] → [orientação concreta e aplicável].
2. [situação observada] → [orientação concreta e aplicável].
3. [situação observada] → [orientação concreta e aplicável].

**Exemplo de resposta em inglês para aprimorar:** [pergunta relevante] → [abordagem recomendada com base no histórico informado, sem inventar realizações].

**Próximo treino de 10 minutos:** [exercício específico].

**Nota:** observações sobre esta simulação, não prova de proficiência, diagnóstico de personalidade nem garantia de contratação.

## Possível evolução: bot de transcrição e apoio ao relatório (NÃO IMPLEMENTADO)

Arquitetura apenas proposta: plataforma da chamada → bot de reunião autorizado / transcrição → extração de evidências por pergunta → rascunho do relatório → **revisão humana** → envio individual por e-mail. A etapa final e o prazo são compromisso do prestador, não do software.

**Pré-condições antes de ligar o bot:**
- Escolher e testar a plataforma; confirmar compatibilidade real para transcrição em inglês e português, qualidade de speaker diarization, latência, custo e falhas.
- Informar antes da chamada que haverá terceiro prestador e processamento de fala, incluindo finalidade, dados coletados, país/transferência, acesso, retenção e exclusão. Obter autorização explícita, específica e verificável antes de gravar ou transcrever.
- Oferecer sessão sem gravação/transcrição com anotações manuais, sem penalizar o cliente.
- Não adicionar bot silenciosamente. Identificar presença na sala, impedir compartilhamento/treinamento indevido, limitar acesso e definir prazo de exclusão antes da implantação.
- Não prometer transcrição literal, pontuação objetiva, medição de fluência, envio automático ou relatório gerado sem revisão.
- Validar com ensaios sintéticos, inclusive vazamento de dados, atribuição incorreta de falas, alucinações de conteúdo e indisponibilidade; sem subir dados pessoais reais em repositórios.
- Alterar o aviso de privacidade e obter nova aprovação antes de liberar transcrição.

## Critério de aceite

Com pessoa de teste fictícia e sem meios de pagamento: verificar formulário PT e EN, texto da oferta (R$80 / 60 min / relatório em até 2 h após a sessão), ausência de captação quando Cloudflare não está ativo e teste sintético do endpoint quando configurado. O merge da oferta foi autorizado em 26/10/2026, mas o deploy permanece bloqueado até os gates descritos em docs/GO_LIVE_INTERVIEW.md.
