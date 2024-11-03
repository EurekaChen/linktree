// or use @ardrive/turbo-sdk/web depending on your environment
import { TurboFactory, USD, developmentTurboConfiguration } from '@ardrive/turbo-sdk/node';
import Arweave from 'arweave';
import { Readable } from 'stream';

export async function publish() {
	/**
	 * 从arweave钱包生成 key.
	 */
	const arweave = new Arweave({});
	const jwk = await arweave.wallets.generate();
	/**
	 * 使用arweave key 创建授权的turbo client
	 */
	const turboAuthClient = TurboFactory.authenticated({
		privateKey: jwk,
		...developmentTurboConfiguration
	});

	/**
	 * 从私钥获取余额.
	 */
	const balance = await turboAuthClient.getBalance();
	console.log('Balance:', balance);

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
		//contentType:'text/html',

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
	console.log(JSON.stringify(uploadResult, null, 2));

	/**
	 * Tops up a wallet with Credits using tokens.
	 * Default token is AR, using Winston as the unit.
	 */
	/* const topUpResult = await turboAuthClient.topUpWithTokens({
          tokenAmount: WinstonToTokenAmount(100_000_000) // 0.0001 AR
      });
      console.log(JSON.stringify(topUpResult, null, 2)); */
}
function getHtml() {
	const hostname = window.location.hostname; // 获取当前主机名
	const parts = hostname.split('.'); // 按点分割
	const gatewayDomainName = parts.slice(-2).join('.'); // 返回最后两部分
	const linktreeUrl = 'https://linktree' + '.' + gatewayDomainName;

	let result = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Link Tree AR</title>
    <meta name="description" content="link tree ar" />
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
                <img src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780" style="width:120px;height: 120px;" />
                <h1 role="heading">Link Tree AR</h1>
                <p>Link Tree On Permaweb.</p>
      <a class="button button-default" href="#" target="_blank" rel="noopener" role="button"
                    ><img
                        class="icon"
                        aria-hidden="true"
                        src="images/icon/generic-website.svg"
                        alt="website"
                    />Website</a
                ><br />
                <a class="button button-github" href="#" target="_blank" rel="noopener" role="button"
                    ><img
                        class="icon"
                        aria-hidden="true"
                        src="images/icon/github.svg"
                        alt="GitHub Logo"
                    />GitHub</a
                ><br />
                <a class="button button-x" href="#" target="_blank" rel="noopener" role="button"
                    ><img class="icon" aria-hidden="true" src="images/icon/x.svg" alt="X Logo" />Follow on
                    X</a
                ><br />
                <a class="button button-yt" href="#" target="_blank" rel="noopener" role="button"
                    ><img
                        class="icon"
                        aria-hidden="true"
                        src="images/icon/youtube.svg"
                        alt="YouTube Logo"
                    />YouTube</a
                ><br />
            </div>
        </div>
    </div>
</body>
</html>`;
	return result;
}
