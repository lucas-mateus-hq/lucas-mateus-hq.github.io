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
export const publishedProducts:PublishedProduct[]=[];
