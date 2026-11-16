# Integrar futuras ofertas

O catálogo público mora em `src/data/products.ts`; `ProductShelf.astro` renderiza as versões PT/EN. Hoje só REIA está cadastrado. O serviço individual tem aplicação independente: adicionar um produto não deve alterar Tally nem misturar dados de clientes.

Para incluir Reta Final ou outro produto, usar a oferta aprovada, ativos reais e checkout verificado. Criar a página, adicionar as traduções e o item do catálogo, atualizar sitemap e conferir idiomas, links, preço, promessa, compra e acesso mobile. Não reutilizar a rota aposentada do Reta Final sem substituir seus redirecionamentos e respectivos testes na mesma mudança. A página de vendas do Reta Final está preparada em `/reta-final/` (`RetaFinalSalesPage.astro`), fora do catálogo, do sitemap e da navegação. Sem `PUBLIC_RETA_FINAL_CHECKOUT_URL` ela mostra a compra como indisponível e não é indexada. A página não escreve domínio nem URL canônica: o domínio e o checkout entram só na publicação, depois de uma compra e entrega reais testadas.

Teste o build e os percursos reais da nova oferta antes de pedir aprovação para publicar. Um checkout que abre não comprova compra e acesso ao material. Analytics opcional e sua atribuição são uma integração separada; não habilitar só por adicionar uma oferta.

## Reta Final · oferta de lançamento e entrega

**Oferta vigente (Fase 1):** preço de lançamento de R$ 97,00, pagamento único pela Greenn e garantia de 7 dias. Não usar preço riscado, prazo, contagem regressiva nem parcelamento que não tenha sido conferido no checkout. Se o preço subir no futuro, ele muda nos três CTAs, no cartão da oferta e nos testes. O preço anterior não vira âncora.

**A página é uma listicle de 10 blocos:** hero, reconhecimento, 5 razões com páginas reais do material, como funciona, o que você recebe, como usar, para quem é, oferta, FAQ e CTA final. A fonte da verdade do layout é o canvas do Claude Design; o arquivo `.astro` é gerado a partir dele. A versão anterior, de 7 dobras, fica no board "Controle" do canvas para o Experimento 1 (controle × listicle). As demonstrações em `public/images/reta-final/pagina-*.webp` são **prévias** de páginas reais dos PDFs: Workbook p. 4, 8, 19, 26, 31, 39 e 46, e a p. 3 de `06_Transcricoes_Mock_Interviews.pdf`. Cada prévia tem 480×680 px. O cabeçalho (ferramenta, etapa e subtítulo) fica nítido e o corpo da página é pixelado e desfocado de forma irreversível, para mostrar a estrutura sem entregar o conteúdo. Para gerar uma nova demonstração, usar sempre esse mesmo tratamento e nunca publicar uma página legível do material pago. Nenhum arquivo pago (`.mp3`, `.zip` ou PDF completo) entra no repositório nem em `dist/`, e os testes verificam isso.

**Os 25 áudios fazem parte do produto,** não são bônus, brinde nem conteúdo opcional.

### Inventário entregue ao comprador

| Item | Conteúdo |
|---|---|
| `00_COMECE_AQUI.txt` | Guia de início: rota, etapas, uso dos áudios, preenchimento e salvamento |
| `01_Reta_Final_Preparacao_para_Entrevistas_em_Ingles.pdf` | Core Workbook, 48 páginas, 4 etapas, 10 ferramentas, preenchível |
| `02_Interview_Day_Card.pdf` | 3 páginas, preenchível |
| `03_Most_Common_Job_Interview_Questions.pdf` | 6 páginas, 12 perguntas, preenchível |
| `04_Business_English_para_Entrevistas.pdf` | 10 páginas, preenchível |
| `05_Transcricoes_Modulos.pdf` | 15 páginas, transcrições L1–L6 e S1–S6 |
| `06_Transcricoes_Mock_Interviews.pdf` | 26 páginas, transcrições M1–M5 em Listening e Speaking Practice |
| `07_Transcricoes_Useful_English_Labs.pdf` | 5 páginas, transcrições P1–P3 (Ouça e repita) |
| `08_Audios_Modulos_de_Entrevista/` | 12 MP3: `01_L1_…_Listening` a `12_S6_…_Speaking_Practice` |
| `09_Audios_Mock_Interviews/` | 10 MP3: `01_M1_Listening_Recruiter_Screen` a `10_M5_Speaking_Practice_Making_a_Recommendation` |
| `10_Audios_Useful_English_Labs/` | 3 MP3: `01_P1_Ownership_and_Results`, `02_P2_Pause_Clarify_and_Continue`, `03_P3_Interview_Facts_and_Professional_Vocabulary` |

São 7 PDFs (113 páginas), 25 MP3 (cerca de 83 MB) e o guia. A fonte é a pasta "Reta Final | Pacote do comprador (versão final)" no Drive do proprietário. Pastas marcadas como recuperadas ou não homologadas não entram na entrega.

`SHA256SUMS.txt` serve só para a validação interna de QA e integração. Ele não vai na raiz do `.zip` do comprador.

### Sequência de publicação (exige aprovação expressa do proprietário)

1. Transferir e configurar o domínio (CNAME, DNS e `site`). Isso move o portfólio inteiro, não só esta rota.
2. Fazer o merge com a compra ainda fechada (`noindex`).
3. Informar a URL da página no campo "Página de Vendas" da Greenn e configurar a entrega do pacote. Se o `.zip` passar do limite de arquivo da Greenn, usar um link somente leitura para a pasta de entrega.
4. Definir `PUBLIC_RETA_FINAL_CHECKOUT_URL`. Os três CTAs viram links e a página passa a ser indexável.
5. Antes de anunciar, fazer uma compra de teste real com o checklist abaixo.

### Checklist da compra de teste

- [ ] O e-mail de acesso da Greenn chega e o link abre no celular e no computador.
- [ ] O pacote baixado tem 7 PDFs, `00_COMECE_AQUI.txt` e 25 MP3 (12 + 10 + 3), com os nomes da tabela acima.
- [ ] Os arquivos conferem com o `SHA256SUMS.txt` interno (`sha256sum -c`).
- [ ] Uma faixa de cada pasta toca no celular e no computador, e a transcrição correspondente é encontrada pelo nome.
- [ ] Um campo do Workbook é preenchido, salvo e continua lá depois de reabrir o arquivo (Acrobat Reader no celular e Chrome no computador).
- [ ] O reembolso dentro da garantia está disponível na Greenn.

### Card da Greenn

`docs/assets/reta-final-greenn-512.png` (512×512): nome do produto, "Workbook + 25 áudios" e o motivo da escada. O card não tem preço, então não precisa ser refeito quando o preço mudar. Ele foi conferido em 96px, o tamanho em que aparece nas listagens.
