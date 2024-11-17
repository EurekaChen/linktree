import { TurboFactory, developmentTurboConfiguration } from "@ardrive/turbo-sdk/web";
//import Arweave from "arweave";
import { prepare } from "./prepare";

export async function upload() {
  const fileContent = prepare();
  //console.log(fileContent);
  //demo_linktree.io:4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y
  try {
    const  Arweave = await import("arweave");
	const arweave=Arweave.init({});

    //const arweave = new Arweave({});
    const jwk = await arweave.wallets.generate();
    const turboAuthClient = TurboFactory.authenticated({
      privateKey: jwk,
      ...developmentTurboConfiguration
    });
    console.log("将linktree html文件发布到Turbo服务中...");

    // 创建一个可读流
    let fileSize: number;
    const readableStream = new ReadableStream({
      start(controller) {
        const stream = new TextEncoder().encode(fileContent);
        fileSize = stream.length;
        controller.enqueue(stream); // 将文本编码为 Uint8Array 并推入流中
        controller.close(); // 指示流结束
      }
    });

    const uploadResult = await turboAuthClient.uploadFile({
      fileStreamFactory: () => readableStream,
      fileSizeFactory: () => fileSize,
      dataItemOpts: {
        // 加入Content-Type以便直接显示而不是下载
        tags: [
          {
            name: "Content-Type",
            value: "text/html"
          }
        ]
        // 没有提供超时或退出信息
      },
      signal: AbortSignal.timeout(10_000) // 10秒后取消上传
    });

    console.log("返回结果：", uploadResult);
    //获取ID
    return uploadResult.id;
  } catch (error) {
    console.log("上传到Arweave出错:", error);
    return "failed";
  }
}
