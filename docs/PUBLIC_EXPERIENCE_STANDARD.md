# Padrão editorial para interfaces públicas — v1 (25/10/2026)

## Prioridade: pessoa visitante, não arquitetura

**Antes de publicar, responda em linguagem natural:** quem chega aqui, o que esta pessoa procura, qual benefício real encontrará e o que pode fazer em seguida? O texto deve ser compreensível fora do contexto do GitHub e do desenvolvimento.

Cada elemento público deve realizar pelo menos uma função:
1. Explicar a oferta, projeto ou trajetória de modo inteligível.
2. Demonstrar valor ou credibilidade com fatos verificáveis, nunca resultados inventados.
3. Facilitar uma decisão ou ação funcional.
4. Comunicar uma condição, risco, privacidade ou limite que de fato influencia a decisão da pessoa.

Sem função identificável, **remover da interface principal ou mover para documentação técnica**. Não transformar uma explicação de segurança ou implementação em argumento comercial.

### Duas audiências distintas

- **Portfólio profissional:** recrutadores e potenciais empregadores. Termos de Talent Acquisition, sourcing, EMEA e ATS são adequados quando têm função real; cargo, atuação e evidências devem preceder especializações experimentais. Projetos de IA são complementares, não experiência de emprego ou produto comercial pronto.
- **Serviço de entrevista:** candidatos. Abrir com a necessidade do candidato, explicar formato, duração, preço, entregável, prazo e próximo passo em poucas linhas. Um CTA que não funciona de verdade não pode se apresentar como agendamento ou envio concluído.
- **Futuras páginas de produto (ex.: Salas):** explicar o que a pessoa fará e perceberá. Termos como orquestração, gates, traces, adaptadores e infraestrutura ficam em documentação/diagnóstico voluntário, exceto quando indispensáveis à escolha do usuário.

### Exemplos de transformação (não copiar mecanicamente)

| Interno / fricção | Público / útil |
| --- | --- |
| Camada pública verificável e segredos internos | O que o visitante pode fazer e como começar |
| AI orchestration literacy | Conectar ferramentas de IA para resolver uma tarefa |
| Arquitetura de conhecimento e estado | Organizar informações para facilitar o trabalho |
| Pipeline de relatórios | Receba um relatório com pontos fortes e melhorias |
| Intake desativado | Corrigir o recebimento antes de lançar; enquanto desativado, descrever honestamente o contato alternativo |

### Transparência não é exposição de bastidores

Manter informações necessárias e verdadeiras sobre proteção de dados, custos, limitações materiais e modo demonstração. Dar-lhes o local e a proporção corretos: avisos próximos da ação relevante, detalhes na política de privacidade ou ajuda. **Nunca ocultar gravação/transcrição, tratamento externo de dados, pagamentos, conteúdo roteirizado, simulações ou funcionalidades indisponíveis.**

Omitir detalhes de implementação que não mudem a decisão. Nunca afirmar que a transcrição, um bot, agendamento, envio automático ou infraestrutura já funcionam quando não foram verificados.

### Gate de revisão humana antes do merge/deploy

**Teste dos cinco segundos:** sem ler documentação, um visitante precisa reconhecer (a) proposta, (b) para quem é, (c) benefício, (d) ação seguinte, (e) status real do que receberá.

**Prova de percurso:** pessoa entra pelo smartphone, encontra o conteúdo, clica no CTA, conclui a ação e entende se houve envio real, encaminhamento manual ou falha. Rever PT-BR e EN-US, sem tradução artificial.

**Revisão de alegações:** confrontar cada resultado, prazo e credencial com evidência disponível. Conferir que limitações relevantes não foram ocultadas por um texto “mais comercial”.

**Revisão editorial:** remover siglas/termos internos sem função para o público, frases sobre arquitetura/segredos, disclaimers repetidos e instruções de operação disfarçadas de copy.

**Teste de publicação:** para a oferta de entrevista, validar recebimento privado ponta a ponta **ou** alterar deliberadamente a experiência para um meio de contato verdadeiramente utilizável antes de disponibilizar a oferta. O contato direto pelo LinkedIn é provisório, pode exigir conexão prévia e não é captação automática de interessados.

Automação pode checar termos proibidos e links; a decisão editorial precisa de revisão humana. CI verde isoladamente **não é** aprovação comercial. Este documento governa revisões futuras, mas **não aprova nem publica** a PR #7.
