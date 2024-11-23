<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "$lib/i18n";
    //AR生态个个包都有slice问题，所它也移到代码中
    //import { createDataItemSigner, dryrun, message, result } from "@permaweb/aoconnect";
    import { getGatewayDomainName } from "$lib/getGatewayDomainName";
    import { getChecksumAddress } from "$lib/etherAddress";
    import { log } from "$lib/store/Debug";
    import { linktreeAntId, linktreeProcessId } from "$lib/constant";
    import { createEthereumSigner } from "$lib/etherAddress";

    let { linktreeId } = $props();

    let gatewayDomainName = $state("ar.io");
    if (typeof window !== "undefined") {
        gatewayDomainName = getGatewayDomainName();
    }

    let arWalletConnected = $state(false);
    let antWarning = $state(true);

    let nameAvailable = $state(false);

    let undername = $state("demo");

    let showAvialableResult = $state(false);
    let isCharValid = $state(false);
    let isAtLeast3 = $state(false);

    let isUndernameValid = $derived(nameAvailable && isCharValid && isAtLeast3);
    let isLinktreeIdValid = $state(false);

    let isChecking = $state(false);

    let showPublish = $state(false);
    let isAoSending = $state(false);
    let showSuccess = $state(false);
    let showFail = $state(false);

    let checked = $state(false);

    let enableCustomId = $state(false);

    if (typeof window !== "undefined") {
        let getlinktreeId = localStorage.getItem("linktreeId");
        if (getlinktreeId) {
            linktreeId = getlinktreeId;
        }
    }

    function onUnderNameChanged() {
        isChecking = false;
        showAvialableResult = false;
        isCharValid = false;
        isAtLeast3 = false;
        nameAvailable = false;
        checked = false;

        isLinktreeIdValid = false;
    }

    async function checkName() {
        //点击检测相当于默认修改了名称
        onUnderNameChanged();

        const idRegex = /^[a-zA-Z0-9_-]+$/;
        isLinktreeIdValid = linktreeId.length == 43 && idRegex.test(linktreeId);

        isChecking = true;

        showSuccess = false;
        showFail = false;

        isAtLeast3 = undername.length > 2 ? true : false;

        //详见："^(?:[a-zA-Z0-9_-]+|@)$" 参见：https://github.com/ar-io/ar-io-ant-process?tab=readme-ov-file#set-record
        //另外txid："^[a-zA-Z0-9_-]{43}$"
        const regex = /^[a-z0-9_-]+$/; // 允许小写字母和连字符
        isCharValid = regex.test(undername);
        if (isAtLeast3 && isCharValid && isLinktreeIdValid) {
            //检查是否可用
            showAvialableResult = false;
            const { ANT } = await import("@ar.io/sdk/web");
            const ant = ANT.init({ processId: linktreeAntId });
            const records = await ant.getRecords();
            if (undername in records) {
                nameAvailable = false;
            } else {
                nameAvailable = true;
                localStorage.setItem("undername", undername);
            }
            showAvialableResult = true;
        }
        isChecking = false;
        checked = true;
    }

    let isFetchingUndername = $state(false);
    async function getUndernames(activeAddress: string) {
        isFetchingUndername = true;
        const { dryrun } = await import("@permaweb/aoconnect");
        let getPlayerMsg = await dryrun({
            process: linktreeProcessId,
            tags: [{ name: "Action", value: "GetUndernames" }],
            data: activeAddress
        });

        log("Undernames：", getPlayerMsg);
        //是否查询到玩家信息
        if (getPlayerMsg.Messages.length > 0) {
            undernames = JSON.parse(getPlayerMsg.Messages[0].Data);
        }
        isFetchingUndername = false;
    }

    let activeAddress = $state("");
    async function connectARWallet() {
        try {
            await window.arweaveWallet.connect(["ACCESS_ADDRESS", "ACCESS_PUBLIC_KEY", "SIGN_TRANSACTION"]);
            arWalletConnected = true;
            activeAddress = await window.arweaveWallet.getActiveAddress();
            getUndernames(activeAddress);
        } catch (error) {
            console.log("Connect error:", error);
            arWalletConnected = false;
        }
    }

    let metmaskConnected = $state(false);

    let walletConnected = $derived(metmaskConnected || arWalletConnected);

    let canPublish = $derived(isUndernameValid && walletConnected);

    interface Undername {
        undername: string;
        target: string;
    }
    let undernames = $state<Undername[]>([]);
    async function connectMetamask() {
        try {
            if (typeof window.ethereum !== "undefined") {
                try {
                    // 请求用户的账户
                    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                    log("Connected account:", accounts[0]);
                    metmaskConnected = true;
                    //const ethereumActiveAddress=window.ethereum.selectedAddress;
                    activeAddress = getChecksumAddress(accounts[0]);
                    log("checksum:", activeAddress);
                    await getUndernames(activeAddress);
                } catch (error) {
                    console.error("User denied account access", error);
                }
            } else {
                log("MetaMask is not installed");
            }
        } catch (error) {
            log("Connect error:", error);
            arWalletConnected = false;
        }
    }

    async function disconnectARWallet() {
        try {
            // 请求断开 ArConnect 钱包
            await window.arweaveWallet.disconnect();
            arWalletConnected = false;
            undernames = [];
        } catch (error) {
            console.error($t("publish.failedArconnect"), error);
        }
    }

    async function disconnectMetamask() {
        metmaskConnected = false;
        undernames = [];
    }

    let isRemoving = $state(false);
    async function removeUndername(undername: string) {
        isRemoving = true;
        const { createDataItemSigner, message, result } = await import("@permaweb/aoconnect");

        let signer;
        if (metmaskConnected) {
            signer = createEthereumSigner() as any;
        }
        if (arWalletConnected) {
            signer = createDataItemSigner(window.arweaveWallet);
        }

        const msgId = await message({
            process: linktreeProcessId,
            tags: [
                { name: "Action", value: "RemoveUndername" },
                { name: "Undername", value: undername }
            ],
            signer: signer,
            data: "linktree"
        });
        log("removeMsgId:", msgId);

        const readResult = await result({ message: msgId, process: linktreeProcessId });
        log("result:", readResult);
        let reply = readResult.Messages[1].Data;
        log("reply:", reply);
        await getUndernames(activeAddress);

        isRemoving = false;
    }

    let fialMsg = $state("");
    async function publish() {
        showPublish = true;
        isAoSending = true;
        const { createDataItemSigner, message, result } = await import("@permaweb/aoconnect");

        let signer;
        if (metmaskConnected) {
            signer = createEthereumSigner() as any;
        }
        if (arWalletConnected) {
            signer = createDataItemSigner(window.arweaveWallet);
        }

        const msgId = await message({
            process: linktreeProcessId,
            tags: [
                { name: "Action", value: "AddUndername" },
                { name: "Undername", value: undername },
                { name: "Target", value: linktreeId }
            ],
            signer: signer,
            data: "linktree"
        });
        log("toAoMsgId:", msgId);

        const readResult = await result({ message: msgId, process: linktreeProcessId });
        log("result:", readResult);
        let reply;
        if (readResult.Messages.length == 1) {
            reply = readResult.Messages[0].Data;
        } else {
            reply = readResult.Messages[1].Data;
        }
        log("reply:", reply);
        isAoSending = false;

        if (reply == "success") {
            showSuccess = true;
            showFail = false;
            await getUndernames(activeAddress);
        } else if (reply == "exceed5") {
            fialMsg = $t("publish.max5Allowed");
            showFail = true;
            showSuccess = false;
        } else if (reply == "exceed2char") {
            fialMsg = $t("publish.charGreaterThan2");
            showFail = true;
            showSuccess = false;
        } else if (reply == "exist") {
            fialMsg = $t("publish.nameExist");
            showFail = true;
            showSuccess = false;
        } else {
            fialMsg = $t("publish.aoIssue");
            showFail = true;
            showSuccess = false;
        }

        //nameAvailable = false;
    }

    onMount(async () => {
        //获取之前设置的undername
        const storageUndername = localStorage.getItem("undername");
        if (storageUndername) {
            undername = storageUndername;
        }

        let storageLinktreeId = localStorage.getItem("linktreeId");
        if (storageLinktreeId) {
            linktreeId = storageLinktreeId;
        }

        // 获取linktree记录信息
        //const io = IO.init();
        //const record = await io.getArNSRecord({ name: 'linktree' });
        //12345678:vDeH1apk0WMyMFCBH1W76D2-8tZG2hstwFNZJqYZUGA
        //linktree:gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk

        (async () => {
            try {
                const module = await import("@ar.io/sdk/web");
                const ANT = module.ANT;
                const ant = ANT.init({ processId: linktreeAntId });
                const records = await ant.getRecords();
                if (undername in records) {
                    nameAvailable = false;
                } else {
                    nameAvailable = true;
                }
                antWarning = false;
            } catch (error) {
                console.error("ANT Error:", error);
                antWarning = true;
            }
        })();
    });
</script>

<div>
    <div style="text-align: center;">
        {#if walletConnected}
            {#if arWalletConnected}
                <button
                    style="font-size: 14px; background-color:#ac9bff;padding:6px;border-radius:5px;border:1px solid gray"
                    type="button"
                    onclick={disconnectARWallet}>
                    {$t("publish.disconnectAr")}
                </button>
            {/if}
            {#if metmaskConnected}
                <button
                    style="font-size: 14px; background-color:#e27624;padding:6px;border-radius:5px;border:1px solid gray"
                    type="button"
                    onclick={disconnectMetamask}>
                    {$t("publish.disconnectMetamask")}
                </button>
            {/if}
        {:else}
            <button
                title={$t("publish.connectArTo")}
                style="font-size: 14px;background-color:#ac9bff;padding:6px;border-radius:5px;border:1px solid gray"
                type="button"
                onclick={connectARWallet}>
                {$t("publish.connectAr")}
            </button>

            <span>|</span>

            <button
                title={$t("publish.connectMetamask")}
                style="font-size: 14px; background-color:#e27624;padding:6px;border-radius:5px;border:1px solid gray"
                type="button"
                onclick={connectMetamask}>
                {$t("publish.connectMetamask")}
            </button>

            <span>|</span>
            <button
                title={$t("publish.commingSoon")}
                style="font-size: 14px; background-color:#ccc;padding:6px;border-radius:5px;border:1px solid gray"
                type="button"
                disabled
                onclick={connectMetamask}>
                {$t("publish.connectSolana")}
            </button>
        {/if}
    </div>
    <p style="font-size:12px; margin-bottom:5px;color:darkgreen" class:hidden={!walletConnected}>
        {$t("publish.walletAddress")}
        <code>{activeAddress}</code>
    </p>
    <hr />

    {#if undernames.length > 0}
        <table
            style="font-size:12px;background-color:#bbdefb;width:100%;border:1px solid #ddd;border-collapse:collapse;">
            <caption style="font-size: 14px;">
                <strong>{$t("publish.yourUndernames")}</strong>
                ({$t("publish.max5Free")})
            </caption>
            <thead>
                <tr style="background:#f5f5f5">
                    <th style="padding:4px;text-align:center;border:1px solid #ddd">{$t("publish.undername")}</th>
                    <th style="padding:4px;text-align:center;border:1px solid #ddd">{$t("publish.linktreeId")}</th>
                    <th style="padding:4px;text-align:center;border:1px solid #ddd">{$t("publish.fork")}</th>
                    <th style="padding:4px;text-align:center;border:1px solid #ddd">{$t("publish.delete")}</th>
                </tr>
            </thead>
            <tbody>
                {#each undernames as undername}
                    <tr>
                        <td style="padding:4px;border:1px solid #ddd">
                            <a href="https://{undername.undername}_linktree.{gatewayDomainName}" target="_blank">
                                {undername.undername}
                            </a>
                        </td>
                        <td style="padding:4px;border:1px solid #ddd">{undername.target}</td>
                        <td style="padding:4px;border:1px solid #ddd">
                            <button>
                                <a
                                    href="https://linktree.{gatewayDomainName}?fork={undername.undername}"
                                    style="text-decoration:none">
                                    🖉
                                </a>
                            </button>
                        </td>
                        <td style="padding:4px;border:1px solid #ddd">
                            <button onclick={() => removeUndername(undername.undername)}>✖</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
        {#if isRemoving}
            <div>{$t("publish.removing")}</div>
        {/if}
    {:else if !walletConnected}
        <div>{$t("publish.connectToFetch")}</div>
    {:else if isFetchingUndername}
        <div>{$t("publish.isFetchingUndername")}</div>
    {:else}
        <div>{$t("publish.noSubmitted")}</div>
    {/if}
    <hr />
    <div style="font-size: 14px; font-weight:bolder">{$t("publish.publishNew")}</div>

    {#if antWarning}
        <div style="color:orangered;margin:10px">{$t("publish.antWarning")}</div>
    {:else}
        <div style="background-color: #bbdefb;padding:10px; font-size:14px">
            <div>
                <label for="custom_text">{$t("publish.linktreeId")}</label>
                <input
                    type="text"
                    style="width: 350px;margin-bottom:5px;font-size:12px"
                    id="custom_text"
                    placeholder={$t("publish.enterYourId")}
                    bind:value={linktreeId}
                    disabled={!enableCustomId} />
                <button
                    onclick={() => {
                        enableCustomId = true;
                    }}
                    title={$t("publish.inputTxid")}
                    class:hidden={enableCustomId}>
                    {$t("publish.customize")}
                </button>
            </div>
            <div>
                <label for="custom_text">{$t("publish.undername")}</label>
                <input
                    type="text"
                    style="width: 150px;margin-bottom:5px"
                    id="custom_text"
                    placeholder={$t("publish.enterYourUndername")}
                    bind:value={undername}
                    onkeydown={onUnderNameChanged} />
                <button onclick={checkName}>{$t("publish.checkValidity")}</button>

                <span style="font-size:12px;color:coral" class:hidden={!isChecking}>🛑 {$t("publish.checking")}</span>

                {#if checked}
                    <span style="font-size:12px" class:hidden={!showAvialableResult}>
                        <span style="font-size:12px;color:darkgreen" class:hidden={!nameAvailable}>
                            ✔ {undername}
                            {$t("publish.isAvailable")}
                        </span>
                        <span style="font-size:12px;color:darkorange" class:hidden={nameAvailable}>
                            ✖ {undername}
                            {$t("publish.isTaken")}
                        </span>
                    </span>
                    <span style="font-size:12px;color:darkred" class:hidden={isCharValid}>
                        ⚠{$t("publish.invalidChar")}
                    </span>
                    <span style="font-size:12px;color:darkred" class:hidden={isAtLeast3}>
                        ⚠{$t("publish.atLeast3")}
                    </span>
                    <span style="font-size:12px;color:darkred" class:hidden={isLinktreeIdValid}>
                        ⚠{$t("publish.invalidLinktreeId")}
                    </span>
                {/if}
            </div>
            <div style="font-size:12px;color:darkgreen">
                {$t("publish.publish")}
                <code>{linktreeId}</code>
                {$t("publish.to")}
                <code>{undername}_linktree.{gatewayDomainName}</code>
            </div>
            <div>
                <button disabled={!canPublish} onclick={publish}>
                    {#if walletConnected}
                        {#if isUndernameValid}
                            <span>{$t("publish.publish")} {undername}</span>
                        {:else}
                            <span>{$t("publish.checkBefore")}</span>
                        {/if}
                    {:else}
                        <span>{$t("publish.connectBefore")}</span>
                    {/if}
                </button>
                <div class:hidden={!showPublish}>
                    <p style="color:darkblue" class:hidden={!isAoSending}>                      
                        {$t("publish.sendingToAO")}
                    </p>
                    <p style="color:darkorange" class:hidden={!showFail}>
                        {fialMsg}
                    </p>
                    <div style="color:darkgreen" class:hidden={!showSuccess}>                       
                        <div><strong>{$t("publish.congratulations")}</strong></div>
                        <p>
                            {$t("publish.note")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .hidden {
        display: none;
    }
</style>
