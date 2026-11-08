# Integrar futuras ofertas

O catálogo público mora em `src/data/products.ts`; `ProductShelf.astro` renderiza as versões PT/EN. Hoje só REIA está cadastrado. O serviço individual tem aplicação independente: adicionar um produto não deve alterar Tally nem misturar dados de clientes.

Para incluir Reta Final ou outro produto, usar a oferta aprovada, ativos reais e checkout verificado. Criar a página, adicionar as traduções e o item do catálogo, atualizar sitemap e conferir idiomas, links, preço, promessa, compra e acesso mobile. Não reutilizar a rota aposentada do Reta Final sem substituir seus redirecionamentos e respectivos testes na mesma mudança. Nenhum placeholder atual anuncia lançamento, preço ou promessa do Reta Final.

Teste o build e os percursos reais da nova oferta antes de pedir aprovação para publicar. Um checkout que abre não comprova compra e acesso ao material. Analytics opcional e sua atribuição são uma integração separada; não habilitar só por adicionar uma oferta.
