export type ProductLanguage='pt-BR'|'en-US';
interface PublishedProduct {
 id:string;
 title:string;
 image:string;
 page:string;
 checkout:string;
 copy:Record<ProductLanguage,{status:string;description:string;details:string;buy:string;alt:string}>;
}
// Only products with an approved offer, working destination, and real assets belong here.
// Reta Final intentionally has no placeholder or commercial promise in this candidate.
export const publishedProducts:PublishedProduct[]=[{
 id:'reia', title:'Renda Extra com IA: Teste, Entregue, Repita',image:'/images/reia-cover.webp',page:'/renda-extra-com-ia/',checkout:'https://pay.hotmart.com/I108167656O',
 copy:{
  'pt-BR':{status:'Disponível agora',description:'Guia com 12 oportunidades de serviços com IA, ferramentas interativas e plano de ação de 30 dias. Compra e entrega pela Hotmart.',details:'Conheça o REIA',buy:'Comprar pela Hotmart',alt:'Capa do guia REIA'},
  'en-US':{status:'Available in Portuguese',description:'A guide with 12 AI service opportunities, interactive tools, and a 30-day action plan. Content and checkout are in Portuguese.',details:'Explore the REIA guide (Portuguese)',buy:'Buy through Hotmart (Portuguese)',alt:'Cover of the REIA guide'}
 }
}];
