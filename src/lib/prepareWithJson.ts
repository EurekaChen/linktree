import { getGatewayDomainName } from "./getGatewayDomainName";

export function prepareWithJson() {
    const gatewayDomainName = getGatewayDomainName;
    const linktreeUrl = "https://linktree" + "." + gatewayDomainName();

    const storageData = localStorage.getItem("linktree");
    if (!storageData) {
        alert("你还没有填写任何数据");
        return "";
    }

    const data = JSON.parse(storageData);
    console.log("linktree", data);

    let result = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>`;
    result += data.title;
    result += `</title>
    <meta name="description" content="`;
    result += data.description;
    result += `" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="`;
    result += linktreeUrl;
    result += `/css/normalize.css" />
    <link rel="stylesheet" href="`;
    result += linktreeUrl;
    result += `/css/linktree.css" />
    <link rel="stylesheet" href="`;
    result += linktreeUrl;
    result += `/css/brand.css" />
	<script type="application/json" id="linktreeJson">`;
	result += storageData;
	result +=`
	</script>	
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="column" style="margin-top: 8%" id="content">                 
            </div>
        </div>
    </div>
	<script>
	const json = JSON.parse(document.getElementById("linktreeJson").textContent);
            const content = document.getElementById("content");
            // 清空现有内容
            content.innerHTML = "";

            // 添加logo
            if (json.logo) {
                const logo = document.createElement("img");
                logo.src = json.logo;
                logo.style.width = "120px";
                logo.style.height = "120px";
                content.appendChild(logo);
            }

            // 添加标题
            const title = document.createElement("h1");
            title.setAttribute("role", "heading");
            title.textContent = json.title;
            content.appendChild(title);

            // 添加描述
            if (json.description) {
                const desc = document.createElement("p");
                desc.innerHTML = json.description + "<br>";
                content.appendChild(desc);
            }

            // 添加链接按钮
            json.links.forEach((link) => {
                const linkElem = document.createElement("a");
                linkElem.className = "button button-"+link.class;
                linkElem.href = link.url;
                linkElem.target = "_blank";
                linkElem.rel = "noopener";
                linkElem.setAttribute("role", "button");

                const icon = document.createElement("img");
                icon.className = "icon";
                icon.setAttribute("aria-hidden", "true");
                icon.src = link.icon;
                icon.alt = link.text;

                linkElem.appendChild(icon);
                linkElem.appendChild(document.createTextNode(link.text));
                content.appendChild(linkElem);
                content.appendChild(document.createElement("br"));
            });

            // 添加Fork和网关链接
            const forkLink = document.createElement("a");
            forkLink.id = "fork";
            forkLink.style.textDecoration = "none";
            forkLink.textContent = "🖉";

            const gatewayLink = document.createElement("a");
            gatewayLink.id = "gateway";
            gatewayLink.style.textDecoration = "none";
            gatewayLink.textContent = "🌍";

             // 处理域名相关逻辑
            const hostname = window.location.hostname;
            const parts = hostname.split("_linktree.");
            const gatewayDomainName = parts[1];
            const undername = parts[0];

            forkLink.href = "https://linktree." + gatewayDomainName + "?fork=" + undername;
            gatewayLink.href = "https://linktree." + gatewayDomainName + "/gateway?undername=" + undername;

            content.appendChild(forkLink);
            content.appendChild(gatewayLink);
	</script>
</body>
</html>`;
    return result;
}
