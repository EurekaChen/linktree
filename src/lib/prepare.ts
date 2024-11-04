import { getGatewayDomainName } from './getGatewayDomainName';

export function prepare() {
	const gatewayDomainName = getGatewayDomainName;
	const linktreeUrl = 'https://linktree' + '.' + gatewayDomainName();

	const storageData = localStorage.getItem('data');
	if (!storageData) {
		alert('你还没有填写任何数据');
		return '';
	}

	const data = JSON.parse(storageData);
	console.log('data', data);

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

	console.log('links', data.links);
	for (const link of data.links) {
		result += `<a class="button button-`;
		result += link.class;
		result += `" href="`;
		result += link.url;
		result += `" target="_blank" rel="noopener" role="button"
        ><img
            class="icon"
            aria-hidden="true"
            src="`;
		result += link.icon;
		result += `"
            alt="`;
		result += link.text;
		result += `"
        />`;
		result += link.text;
		result += `</a
    >
    <br />
    `;
	}

	result+=`
	<a id="edit" style="text-decoration: none;" href="https://linktree.ar.io?edit=demo">🖉</a>
					<a id="gateway" style="text-decoration: none;" href="https://linktree.ar.io/gateway?undername=demo">🌍</a>
					<script>						
						const hostname = window.location.hostname; 
						const parts = hostname.split('.'); 
						const gatewayDomainName = parts.slice(-2).join('.'); 						
						const name=parts.slice(-3,-2)[0];
						console.log(name);
						const undername=name.replace("_linktree","");
						const editLink=document.getElementById('edit');
						editLink.href="https://linktree."+gatewayDomainName+"?edit="+undername;
						const gatewayLink=document.getElementById('gateway');
						gatewayLink.href="https://linktree."+gatewayDomainName+"/gateway?undername="+undername;
					</script>	`;
	result += `      
            </div>
        </div>
    </div>
</body>
</html>`;
	return result;
}
