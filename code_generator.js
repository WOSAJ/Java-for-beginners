let lightmaps = {
    "java": javaLight
}

{
    let req = new XMLHttpRequest();
    req.onload = () => {
        if(req.status != 200) return;
        let objs = JSON.parse(req.response);
        objs.forEach(obj => {
            let tag = document.createElement(obj.tag);
            if(obj.content != undefined) tag.innerHTML = obj.content;
            for (const key in obj.attributes) {
                tag.setAttribute(key, obj.attributes[key]);
            }
            let target = document.getElementsByTagName(obj.target)[0];
            switch(obj.position) {
                case "first":
                    target.insertBefore(tag, target.firstChild);
                break;
                case "last":
                default:
                    target.appendChild(tag);
                break
            }
        });
    }
    req.open("GET", "./head.json");
    req.send();
}

let elements = document.getElementsByTagName("code")
for (let i = 0; i < elements.length; i++) {
    let element = elements.item(i);
    let text = element.textContent.normalize().trim();
    let lang = !element.getAttribute("lang") ? "Java" : element.getAttribute("lang");
    element.replaceWith(generateCode(text, lang));
}

//#region functions
function generateCode(text, lang) {
    let ol = document.createElement("ol");
    lightmaps[lang.toLowerCase()](text).split("\n").forEach(str => {
        let li = document.createElement("li");
        li.innerHTML = str;
        ol.appendChild(li);
    });
    let div = document.createElement("div");
    let p = document.createElement("h6");
    p.innerText = lang;
    div.appendChild(p);
    div.appendChild(ol);
    div.classList.add("code");
    return div;
}

function javaLight(raw) {
    const lights = [
        s => {
            const regex = /(?<![a-zA-Z])(abstract|assert|boolean|break|byte|case|catch|char|class(?!=)|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|bsynchronized|this|throw|throws|transient|try|void|volatile|while)(?![a-zA-Z])/gm;
            return s.replace(regex, s => '<span class="javaword">' + s + '</span>');
        }, s => {
            const regex = /(?<=\.)([A-Za-z]\w*)(?![\w\s]*\()/gm;
            return s.replace(regex, s => '<span class="javafield">' + s + '</span>');
        }, s => {
            const regex = /(@\w+)/gm;
            return s.replace(regex, s => '<span class="javaannotation">' + s + '</span>');
        }, s => {
            const regex = /[\d_]+/gm;
            return s.replace(regex, s => '<span class="javanumber">' + s + '</span>');
        }, s => {
            const regex = /'(\\?(.?|u[\dA-Fa-f]{4}))'/;
            return s.replace(regex, s => '<span class="javastring">' + s + '</span>')
        }, s=> {
            const regex = /\\((u[\dA_Fa-f]{4})|.)/gm;
            return s.replace(regex, s => '<span class="javaword">' + s + '</span>');
        }, s => {
            const regex = /(?<= )[a-z][a-zA-Z]+(?=\()/gm;
            return s.replace(regex, s => '<span class="javamethod">' + s + '</span>');
        }, s => {
            const regex = /(?<=(import|package)<\/span>).+;/gm;
            return s.replace(regex, s => '<span class="nolight">' + s + '</span>')
        }, s => {
            const regex = /(?<=\n)\s+/gm;
            return s.replace(regex, s => '<pre>' + s + '</pre>');
        }, s => {
            const regex = /(\/\*.*?\*\/)|\/\/.*\n/gm;
            return s.replace(regex, s => '<span class="comment">' + s + '</span>');
        }
    ];
    
    let strings = raw.split(/(?<!\\)"/gm);
    let isString = false;
    let string = '';
    strings.forEach(s => {
        if(isString) {
            string += '<span class="javastring">"' + s + '"</span>'
        } else {
            let ss = s;
            lights.forEach(func => {
                ss = func(ss);
            });
            string += ss;
        }
        isString = !isString;
    });
    return string;
}
//#endregion
