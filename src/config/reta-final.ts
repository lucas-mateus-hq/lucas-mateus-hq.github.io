// Checkout do Reta Final. Fica vazio até a oferta ser aprovada e o checkout ser testado
// com compra e entrega reais; enquanto vazio, a página mostra o estado indisponível e não é indexada.
// O endereço entra pela variável PUBLIC_RETA_FINAL_CHECKOUT_URL no momento da publicação.
const raw = (import.meta.env.PUBLIC_RETA_FINAL_CHECKOUT_URL ?? '').trim();
export const retaFinalCheckoutUrl: string = /^https:\/\/[^\s"'<>]+$/.test(raw) ? raw : '';
