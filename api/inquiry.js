const cheerio = require("cheerio");

function abs(base, href){
  try { return new URL(href, base).toString(); } catch (e) { return href; }
}

module.exports = async function(req, res){
  const url = "http://oticon.or.kr/oticon_inquiry";
  try{
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const html = await r.text();
    const $ = cheerio.load(html);

    let table = null;
    $("table").each((i, el)=>{
      const txt = $(el).text();
      if(txt.includes("번호") && txt.includes("제목") && (txt.includes("글쓴이") || txt.includes("작성자"))){
        table = el;
        return false;
      }
    });

    let writeLink = null;
    $("a").each((i, el)=>{
      const t = $(el).text().replace(/\s+/g," ").trim();
      const href = $(el).attr("href") || "";
      if((t.includes("글쓰기") || t.includes("문의")) && href){
        writeLink = abs(url, href);
        return false;
      }
    });

    if(!table){
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      return res.status(200).json({ ok:false, message:"table_not_found", source:url, writeLink });
    }

    const items = [];
    $(table).find("tr").each((i, tr)=>{
      const tds = $(tr).find("td");
      if(tds.length >= 3){
        const cols = [];
        tds.each((_, td)=> cols.push($(td).text().replace(/\s+/g," ").trim()));
        const a = $(tr).find("a").first();
        const href = a.attr("href");
        const title = a.text().replace(/\s+/g," ").trim() || cols[1] || "";
        const link = href ? abs(url, href) : url;

        const num = cols[0] || "";
        const author = cols.find(c => c && c.length>0 && c !== num && c !== title && c.length<=20) || "";
        const date = cols.find(c => /\d{4}\.\d{2}\.\d{2}/.test(c) || /\d{4}-\d{2}-\d{2}/.test(c)) || "";

        if(title){
          items.push({ num, title, author, date, link });
        }
      }
    });

    const uniq = [];
    const seen = new Set();
    for(const it of items){
      const key = it.title + "|" + it.date + "|" + it.num;
      if(!seen.has(key)){
        seen.add(key);
        uniq.push(it);
      }
    }

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=120, stale-while-revalidate=120");
    return res.status(200).json({ ok:true, source:url, writeLink, items: uniq.slice(0, 30) });
  }catch(err){
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    return res.status(500).json({ ok:false, error: String(err) });
  }
};
