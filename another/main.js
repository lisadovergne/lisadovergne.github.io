const sheets = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRd93KIbT-CyUu3Ei8pNS1pKPOdwoTXCistUGbnPlMRgPyGZOFkrnk4AxvBIwtLYa-QTdE8XuLbmAJS/pub?output=csv";
const response = await fetch(sheets);
const csvText = await response.text();

const sanitizeName = (name) => {
  const accentsMap = new Map([ ['á', 'a'], ['à', 'a'], ['â', 'a'], ['ä', 'a'], ['ã', 'a'], ['å', 'a'], ['é', 'e'], ['è', 'e'], ['ê', 'e'], ['ë', 'e'], ['í', 'i'], ['ì', 'i'], ['î', 'i'], ['ï', 'i'], ['ó', 'o'], ['ò', 'o'], ['ô', 'o'], ['ö', 'o'], ['õ', 'o'], ['ø', 'o'], ['ú', 'u'], ['ù', 'u'], ['û', 'u'], ['ü', 'u'], ['ý', 'y'], ['ÿ', 'y'], ['ñ', 'n'], ['ç', 'c'] ]);
  let sanitized = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  sanitized = Array.from(sanitized).map(char => accentsMap.get(char) || char).join('');
  return sanitized.replace(/[^A-Za-z0-9_\-]/g, '_');
};


/**
 * Convertit une chaîne CSV en objet JSON en utilisant ES6
 * @param {string} csvString - La chaîne CSV à convertir
 * @returns {Array} - Tableau d'objets représentant les données CSV
 */
const csvToJson = (csvString) => {
  try {
    const lines = [];
    let currentLine = '';
    let insideQuotes = false;
    
    for (let i = 0; i < csvString.length; i++) {
      const char = csvString[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
        currentLine += char;
      } else if (char === '\n' && !insideQuotes) {
        lines.push(currentLine);
        currentLine = '';
      } else {
        currentLine += char;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    const headers = lines[0].split(',').map(header => header.trim());
    const result = [];
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      
      const values = [];
      let currentValue = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      values.push(currentValue);
      
      const obj = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        value = value.replace(/\r/g, '');

        if (value.includes('\n')) {
          value = value.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
        }
        
        obj[header] = value;
      });
      
      result.push(obj);
    }
    
    return result;
  } catch (error) {
    console.error("Erreur lors de la conversion CSV en JSON:", error);
    return [];
  }
};




const bgColors = ["red", "blue","gray","green","yellow","purple","orange","pink","brown","black","white"];

const _json = csvToJson(csvText);

// ajoute 6 fois _json dans const json
const json = [..._json, ..._json,..._json, ..._json,..._json, ..._json];




const $projets = document.querySelector(".projets");

// parcourir le json et créer les éléments
json.forEach((item) => {
  const div = document.createElement("div");
  div.classList.add("projet");
  $projets.appendChild(div);
  // gsap.set(div,{backgroundColor: e => gsap.utils.random(bgColors)});
  // gsap.from(div, {
  //   x: e=> gsap.utils.random(-1000,1000),
  //   y : e  => gsap.utils.random(-1000,-20),
  //   opacity:0, duration: 0.5 });

  const img = document.createElement("img");
  img.src = `img/${sanitizeName(item.titre)}.jpg`;
  div.appendChild(img);


  const titre = document.createElement("h1");
  titre.textContent = item.titre;
  // div.appendChild(titre);

  const categories = document.createElement("div");
  categories.textContent = item.catégories;
  // div.appendChild(categories);

  const description = document.createElement("p");
  description.textContent = item.description;
  div.appendChild(description);

  div.addEventListener("click", () => {
    const header = document.querySelector("header");
    header.classList.add("fixed");

    const projets = document.querySelector(".projets");
    projets.classList.add("fixed");

    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    document.body.appendChild(overlay);

    const wrap = document.createElement("div");
    wrap.classList.add("wrap");
    overlay.appendChild(wrap);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche");
    wrap.appendChild(fiche);

    const close = document.createElement("div");
    close.textContent = "×";
    close.classList.add("close");
    overlay.appendChild(close);

    gsap.fromTo(overlay, 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.4 }
    );

    // amélioration de la fermeture de la fiche
    overlay.addEventListener("click", (e) => {
      if (e.target === fiche || fiche.contains(e.target)) return;
      gsap.to(overlay, {opacity: 0, duration: 0.2, onComplete: () => overlay.remove()});
      header.classList.remove("fixed");
      projets.classList.remove("fixed");
    });

    const img = document.createElement("img");
    img.src = `img/${sanitizeName(item.titre)}.jpg`;
    fiche.appendChild(img);

    const titre = document.createElement("h1");
    titre.textContent = item.titre;
    fiche.appendChild(titre);

    const desc = document.createElement("div");
    desc.innerHTML = item.modale;
    fiche.appendChild(desc);

    if(item.images !== "") {
      const images = item.images.split(",");
      const gallery = document.createElement("div");
      gallery.classList.add("gallery");
      images.forEach((image) => {
        const img = document.createElement("img");
        const name = sanitizeName(item.titre);
        img.src = `img/${name}/${image}`;
        gallery.appendChild(img);
      });
      fiche.appendChild(gallery);
    }
  

    // gsap.from(fiche, {opacity: 0, duration: 0.4});
    // gsap.from(overlay, {opacity: 0, duration: 0.4});
  });


});

// base pour le plugin motionPath
gsap.registerPlugin(MotionPathPlugin);
// base pour la position selon le viewport
const w = window.innerWidth;
const h = window.innerHeight;

// question ia :
// je veux le chemin d d'un path en forme d'ellipse avec un rayon de (h-100)/2 et (w-100)/2 (avec quelques modifications)
const d = `M${w / 3 - 10 + 250},-200 L${w / 3 - 10 + 250},${h + 200} 
  M${w / 2 + 250},${h + 200} L${w / 2 + 250},-200
  M${(2 * w) / 3 + 10 + 250},-200 L${(2 * w) / 3 + 10 + 250},${h + 200}`;
//const d = `M${w/2} ${h/2 - h/4} m -${(w-300)/2}, 0 a ${(w-300)/2},${h/4} 0 1,0 ${(w-300)},0 a ${(w-300)/2},${h/4} 0 1,0 -${(w-300)},0`;

// pour la demo
// ajoute le path dans un svg
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    document.body.appendChild(svg);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    //path.setAttribute("stroke", "red");
    path.setAttribute("fill", "none");
    svg.appendChild(path);

    // SVG sur z-index -1
    svg.style.position = "absolute";
    svg.style.top = 0;
    svg.style.left = 0;
    svg.style.zIndex = -1;


    gsap.set(".projet", {
      xPercent: -50, 
      yPercent: -50, 
      transformOrigin: "50% 50%"
     });


let anim = gsap.to('.projet', {
  motionPath: {
    path: d,
    // autoRotate: true,
    // aligne sur le centre, un peu merdique
    // alignOrigin: [0.5, 0.5],
    // align:path,
  },
  duration: 10*3,
  stagger: {
    each : 2/4.7*3.5/3,
    // each:2/4.7*3.5
    repeat:-1,
  },
  ease: "none"
});
anim.pause();
anim.play(10*3);

/*draggable*/
gsap.registerPlugin(Draggable);
// Make text elements draggable
Draggable.create(".wrapper", {
});
