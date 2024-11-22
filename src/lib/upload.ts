//import Arweave from "arweave";
import { prepare } from "./prepare";
import { log } from "./store/Debug";

export async function upload() {
    const fileContent = prepare();
    try {
        const {default:Arweave} = await import('arweave');
        const arweave = new Arweave({});
        const jwk = await arweave.wallets.generate();
        const { TurboFactory, developmentTurboConfiguration } = await import("@ardrive/turbo-sdk/web");
        const turboAuthClient = TurboFactory.authenticated({
            privateKey: jwk,
            ...developmentTurboConfiguration
        });

        log("将linktree html文件发布到Turbo服务中...");
        // 创建一个可读流
        const content = new TextEncoder().encode(fileContent);
        const fileSize = content.length;
        const readableStream = new ReadableStream({
            start(controller) {
                controller.enqueue(content);
                controller.close();
            }
        });

        //上传到Turbo
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

        log("上传Turbo返回结果：", uploadResult);
        //获取ID
        return uploadResult.id;
    } catch (error) {
        log("上传到Arweave时出错:", error);
        return "failed";
    }
}
