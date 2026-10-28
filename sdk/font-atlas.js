/* Font Atlas SDK 0.2.0 | MIT for integration code; font licenses are separate. */
export class FontAtlas {
  constructor(options={}) {
    this.catalogUrl=options.catalogUrl || "https://hossean787-blip.github.io/font-atlas-library/api/v1/fonts.json";
    this.catalog=null;
  }
  async init({signal}={}) {
    const response=await fetch(this.catalogUrl,{signal});
    if(!response.ok) throw new Error("Font Atlas catalog HTTP "+response.status);
    const data=await response.json();
    if(data.schemaVersion!=="1.0.0" || !Array.isArray(data.fonts)) throw new Error("Unsupported catalog schema");
    this.catalog=data;
    return this;
  }
  list({script,category,query}={}) {
    if(!this.catalog) throw new Error("Call init() first");
    const term=String(query||"").trim().toLocaleLowerCase();
    return this.catalog.fonts.filter(font=>(!script||font.scripts.includes(script))&&(!category||font.category===category)&&(!term||font.name.toLocaleLowerCase().includes(term)||font.id.includes(term)));
  }
  get(id) {return this.list().find(font=>font.id===id)||null;}
  cssUrl(id,{weights=[400,700]}={}) {
    const font=this.get(id);
    if(!font) throw new Error("Unknown font: "+id);
    if(font.provider!=="google-fonts") throw new Error("Unsupported CSS provider");
    const accepted=[...new Set(weights.map(Number))].filter(n=>Number.isInteger(n)&&n>=100&&n<=900&&n%100===0).sort((a,b)=>a-b);
    if(!accepted.length) throw new Error("No valid weights");
    return "https://fonts.googleapis.com/css2?family="+encodeURIComponent(font.cssFamily).replace(/%20/g,"+")+":wght@"+accepted.join(";")+"&display=swap";
  }
  load(id,options={}) {
    if(typeof document==="undefined") throw new Error("load() requires a browser");
    const url=this.cssUrl(id,options);
    const existing=[...document.querySelectorAll('link[rel="stylesheet"]')].find(link=>link.href===url);
    if(existing) return existing;
    const link=document.createElement("link");link.rel="stylesheet";link.href=url;link.dataset.fontAtlas=id;document.head.append(link);return link;
  }
}
