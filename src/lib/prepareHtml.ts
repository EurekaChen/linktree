
export function prepareHtml() {
	const hostname = window.location.hostname; // 获取当前主机名
	const parts = hostname.split('.'); // 按点分割
	const gatewayDomainName = parts.slice(-2).join('.'); // 返回最后两部分
	const linktreeUrl = 'https://linktree' + '.' + gatewayDomainName;

	const storageData = localStorage.getItem('data');
	if (!storageData) {
		alert('你还没有填写任何数据');
		return '';
	}

	const data = JSON.parse(storageData);
	console.log("data",data);

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
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="column" style="margin-top: 10%">
                <img src="`;
	result += data.logo;
	result += `" style="width:120px;height: 120px;" />
                <h1 role="heading">`;
	result += data.title;
	result += `</h1>
                <p>`;
	result += data.description;
	result += `</p>`;

	// for (const link in data.links) {
	// 	result += `<a class="button button-`;
	// 	result += link.buttonClass;
	// 	result += `" href="`;
	// 	result += link.url;
	// 	result += `" target="_blank" rel="noopener" role="button"
    //     ><img
    //         class="icon"
    //         aria-hidden="true"
    //         src="`;
	// 	result += link.src;
	// 	result += `"
    //         alt="`;
	// 	result += link.text;
	// 	result += `"
    //     />`;
	// 	result += `</a
    // >
    // <br />
    // `;
	// }

	result += `      
            </div>
        </div>
    </div>
</body>
</html>`;
	return result;
}
