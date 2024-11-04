// import { TurboFactory, developmentTurboConfiguration } from '@ardrive/turbo-sdk/web';
// import Arweave from 'arweave';
// import { Readable } from 'stream';
import { prepare } from './prepare';

export async function upload() {
	const fileContent = prepare();
	console.log(fileContent);
	//demo_linktree.io:4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y
	return '4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y';
	const arweave = new Arweave({});
	const jwk = await arweave.wallets.generate();
	const turboAuthClient = TurboFactory.authenticated({
		privateKey: jwk,
		...developmentTurboConfiguration
	});
	const fileSize = Buffer.byteLength(fileContent, 'utf-8');

	console.log('将linktree html文件发布到Turbo服务中...');
	const uploadResult = await turboAuthClient.uploadFile({
		fileStreamFactory: () => {
			const readable = new Readable();
			readable._read = () => {}; // _read is required but you can noop it
			readable.push(fileContent);
			readable.push(null); // 表示文件结束
			return readable;
		},
		fileSizeFactory: () => fileSize,
		dataItemOpts: {
			// 加入Content-Type以便直接显示而不下载
			tags: [
				{
					name: 'Content-Type',
					value: 'text/html'
				}
			]
			// 没有提供超时或退出信息
		},
		signal: AbortSignal.timeout(10_000) // 10秒后取消上传
	});

	console.log('返回结果：', uploadResult);
	console.log(JSON.stringify(uploadResult, null, 2));
}
