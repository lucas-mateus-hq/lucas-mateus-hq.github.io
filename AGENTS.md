# Instruções para agentes — site pessoal público

## Leia antes de editar conteúdo publicado
O padrão editorial obrigatório é [docs/PUBLIC_EXPERIENCE_STANDARD.md](docs/PUBLIC_EXPERIENCE_STANDARD.md). O site atende pessoas reais, não é README de arquitetura. Toda frase visível precisa esclarecer a proposta, provar credibilidade verdadeira, orientar uma ação ou comunicar transparência material. Remover jargão interno sem relevância, não esconder riscos que alterem a decisão da pessoa.

## Audiências e hierarquia
- Portfólio: recrutadores e potenciais empregadores; primeiro experiência profissional real, responsabilidades e evidências verificáveis. Termos técnicos próprios de recrutamento são aceitáveis quando ajudam essa audiência. Não converter projetos experimentais em credenciais comerciais falsas.
- Serviço de simulação de entrevista: candidatos; descrever em linguagem direta a dificuldade que resolve, prática ao vivo, R$ 80, 60 minutos, relatório por e-mail em até 2 horas após a sessão, como solicitar e como o retorno acontece. Não divulgar bot, transcrição automática, calendário, pagamento integrado ou envio automático sem verificação operacional.
- Reta Final: produto de aprendizagem autônoma distinto da simulação individual; preservar estado real de lançamento e não substituir uma oferta pela outra.

## Verificação antes de abrir/encerrar PR
1. Ler o texto como visitante pela primeira vez e executar o teste de cinco segundos; registrar público, benefício, credibilidade e CTA.
2. Percorrer os fluxos PT-BR e EN-US em mobile e desktop. O sucesso exige que o CTA **faça o que declara**. Explicações técnicas não corrigem falhas de recebimento.
3. Rever alegações factuais, preço, duração, prazo, datas, indisponibilidade, dados, privacidade e estados de compra/contato. Não inventar depoimentos, certificações, disponibilidade ou vendas.
4. Executar build, testes automatizados e observação em navegador. CI verde **não** aprova comunicação ou viabilidade comercial sozinho.
5. Criar PR draft e mostrar ao proprietário. **Não fazer merge/deploy de mudança de oferta sem aprovação expressa.** No GitHub Pages, o deploy acontece quando alterações chegam à `main`.
6. Não recolher dados sem informar; se o backend de captação estiver inativo, mostrar encaminhamento manual de maneira verdadeira e sinalizar como pendência pré-publicação.

Preservar versões, traduções e conteúdo aprovado; não introduzir complexidade técnica só para descrever o funcionamento. Não usar o portfólio pessoal como painel de governança de outros projetos.
