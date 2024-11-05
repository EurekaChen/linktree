import { ArconnectSigner, TurboFactory, developmentTurboConfiguration } from '@ardrive/turbo-sdk/web';
import Arweave from 'arweave';
import { prepare } from './prepare';
//import { Readable } from 'stream';




export async function upload() {
	const fileContent = prepare();
	console.log(fileContent);
	//demo_linktree.io:4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y
	//return '4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y';
	//try {
		//const arweave = new Arweave({});
		// const jwk = await arweave.wallets.generate();
		// const turboAuthClient = TurboFactory.authenticated({
		// 	privateKey: jwk,
		// 	...developmentTurboConfiguration
		// });
		//const signer=new ArconnectSigner(window.arweaveWallet);	
		//const fileSize = Buffer.byteLength(fileContent, 'utf-8');
	//	const turboAuthClient = TurboFactory.authenticated(signer,...developmentTurboConfiguration);

	//const  Arweave  = await import('arweave');
		
	const arweave = new Arweave({});
			const jwk = await arweave.wallets.generate();
		 const turboAuthClient = TurboFactory.authenticated({	privateKey: jwk,...developmentTurboConfiguration});
		console.log('将linktree html文件发布到Turbo服务中...');


		 // 创建一个可读流
		 const readableStream = new ReadableStream({
			start(controller) {				
				controller.enqueue(new TextEncoder().encode(fileContent)); // 将文本编码为 Uint8Array 并推入流中
				controller.close(); // 指示流结束
			}
		});

		async function getStreamLength(readableStream) {
			const reader = readableStream.getReader();
			let totalLength = 0;
		
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break; // 流结束
					totalLength += value.length; // 累加每个块的长度
				}
			} finally {
				reader.releaseLock(); // 释放锁
			}
		
			return totalLength; // 返回总长度
		}

	    const	fileSize=await getStreamLength(readableStream);

		const uploadResult = await turboAuthClient.uploadFile({
			fileStreamFactory:()=>readableStream,
			//fileStreamFactory:()=> createReadableStream(fileContent),
			//fileStreamFactory: () => {return Buffer.from(fileContent)},
			// fileStreamFactory: () => {
			// 	const readable = new Readable();
			// 	readable._read = () => {}; // _read is required but you can noop it
			// 	readable.push(fileContent);
			// 	readable.push(null); // 表示文件结束
			// 	return readable;
			// },
			fileSizeFactory: () => fileSize,
			dataItemOpts: {
				// 加入Content-Type以便直接显示而不是下载
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
		//获取ID
		console.log('id',uploadResult.id)
		return uploadResult.id;
	// } catch (error) {
	// 	console.log(error);
	// 	return 'failed';
	// }
}

