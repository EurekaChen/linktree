// or use @ardrive/turbo-sdk/web depending on your environment
import { TurboFactory, USD, developmentTurboConfiguration } from '@ardrive/turbo-sdk/node';
import Arweave from 'arweave';
import { Readable } from 'stream';

export async function publish() {
	
	const arweave = new Arweave({});
	const jwk = await arweave.wallets.generate();	
	const turboAuthClient = TurboFactory.authenticated({privateKey: jwk,...developmentTurboConfiguration});	
	
    //const balance = await turboAuthClient.getBalance();
	//console.log('Balance:', balance);

	/**
	 * Fetch the estimated amount of winc returned for 10 USD (1000 cents).
	 * 获取法币10USD返回和winc数量
	 */
	// const estimatedWinc = await turboAuthClient.getWincForFiat({
	// 	amount: USD(10)
	// });
	// console.log('10 USD to winc:', estimatedWinc);

	/**
	 * Post local files to the Turbo service.
	 * 将本地文件放到Turbo服务
	 */
	console.log('Posting raw file to Turbo service...');

	const fileContent = getHtml();
	//const fileSize = fs.statSync(filePath).size;
	const fileSize = Buffer.byteLength(fileContent, 'utf-8');
	const uploadResult = await turboAuthClient.uploadFile({
		fileStreamFactory: () => {
			const readable = new Readable();
			readable._read = () => {}; // _read is required but you can noop it
			readable.push(fileContent);
			readable.push(null); // indicates end of file
			return readable;
		},
		fileSizeFactory: () => fileSize,
        dataItemOpts: {
			// optional
			tags: [
				{
					name: 'Content-Type',
					value: 'text/html'
				}
			]
			// no timeout or AbortSignal provided
		},
		signal: AbortSignal.timeout(10_000) // cancel the upload after 10 seconds
	});

    console.log("返回结果：", uploadResult);
	console.log(JSON.stringify(uploadResult, null, 2));

}

function getHtml() {
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

	for (const link in data.links) {
		result += `<a class="button button-`;
		result += link.buttonClass;
		result += `" href="`;
		result += link.url;
		result += `" target="_blank" rel="noopener" role="button"
        ><img
            class="icon"
            aria-hidden="true"
            src="`;
		result += link.src;
		result += `"
            alt="`;
		result += link.text;
		result += `"
        />`;
		result += `</a
    >
    <br />
    `;
	}

	result += `      
            </div>
        </div>
    </div>
</body>
</html>`;
	return result;
}
