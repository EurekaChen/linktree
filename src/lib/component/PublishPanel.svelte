<script lang="ts">
    import { onMount } from "svelte";
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

    let isUndernameValid=$derived(nameAvailable&&isCharValid)
    let isLinktreeIdValid=$state(false);

    let isChecking = $state(false);  

    let showPublish = $state(false);
    let isAoSending = $state(false);
    let showSuccess = $state(false);
    let showFail = $state(false);

    let checked=$state(false);

    //let linktreeId = $state("Get linktree Id by upload to arweave"); //这是demo的id,4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y

    let enableCustomId=$state(false);

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
        nameAvailable = false;
        checked=false;

        isLinktreeIdValid=false;
    }

    async function checkName() {
        //点击检测相当于默认修改了名称
        onUnderNameChanged();   
        
        const idRegex=/^[a-zA-Z0-9_-]+$/;
        isLinktreeIdValid = (linktreeId.length==43 && idRegex.test(linktreeId));     

        isChecking=true;

        showSuccess = false;
        showFail = false;
        //详见："^(?:[a-zA-Z0-9_-]+|@)$" 参见：https://github.com/ar-io/ar-io-ant-process?tab=readme-ov-file#set-record
        //另外txid："^[a-zA-Z0-9_-]{43}$"
        const regex = /^[a-z0-9_-]+$/; // 允许小写字母和连字符
        isCharValid = regex.test(undername);
        if (isCharValid && isLinktreeIdValid) {
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
        checked=true;   
    }

    let isFetchingUndername = $state(false);
    async function getUndernames(activeAddress: string) {
        isFetchingUndername = true;
        const {dryrun}= await import("@permaweb/aoconnect");
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

    let canPublish=$derived(isUndernameValid&&walletConnected)

    let undernames = $state([]);
    async function connectMetamask() {
        try {
            if (typeof window.ethereum !== "undefined") {
                try {
                    // 请求用户的账户
                    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                    console.log("Connected account:", accounts[0]);
                    metmaskConnected = true;
                    //const ethereumActiveAddress=window.ethereum.selectedAddress;
                    activeAddress = getChecksumAddress(accounts[0]);
                    log("checksum:", activeAddress);
                    await getUndernames(activeAddress);
                } catch (error) {
                    console.error("User denied account access", error);
                }
            } else {
                console.log("MetaMask is not installed");
            }
        } catch (error) {
            console.log("Connect error:", error);
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
            console.error("Failed to disconnect from ArConnect wallet", error);
        }
    }

    async function disconnectMetamask() {
        metmaskConnected = false;
        undernames = [];
    }

    let isRemoving=$state(false);
    async function removeUndername(undername:string) {
        isRemoving = true;
        const  { createDataItemSigner,  message, result }= await import("@permaweb/aoconnect");

        let signer;
        if(metmaskConnected){
            signer = createEthereumSigner() as any;
        }
        if(arWalletConnected){
            signer=createDataItemSigner(window.arweaveWallet);
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
        log("result:",readResult);
        let reply = readResult.Messages[1].Data;
        log("reply:",reply); 
        await getUndernames(activeAddress);

        isRemoving = false;                  

    }

    async function publish() {
        //发到AO进行发布

        showPublish = true;
        isAoSending = true;
        const  { createDataItemSigner,  message, result }= await import("@permaweb/aoconnect");

        let signer;
        if(metmaskConnected){
            signer = createEthereumSigner() as any;
        }
        if(arWalletConnected){
            signer=createDataItemSigner(window.arweaveWallet);
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
        log("result:",readResult);
        let reply = readResult.Messages[1].Data;
        log("reply:",reply);
        isAoSending = false;
        if (reply == "success") {
            showSuccess = true;
            showFail = false;
            await getUndernames(activeAddress);
        } else {
            showFail = true;
            showSuccess = false;
        }
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
                console.error("导入失败ANT:", error);
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
                    Disconnect Ar Wallet
                </button>
            {/if}
            {#if metmaskConnected}
                <button
                    style="font-size: 14px; background-color:#e27624;padding:6px;border-radius:5px;border:1px solid gray"
                    type="button"
                    onclick={disconnectMetamask}>
                    Disconnect Metamask
                </button>
            {/if}
        {:else}
            <button
                title="Connect AR wallet to publish undername"
                style="font-size: 14px;background-color:#ac9bff;padding:6px;border-radius:5px;border:1px solid gray"
                type="button"
                onclick={connectARWallet}>
                Connect AR Wallet
            </button>

            <span>|</span>

            <button
                title="Connect mestask wallet to publish undername"
                style="font-size: 14px; background-color:#e27624;padding:6px;border-radius:5px;border:1px solid gray"
                type="button"
                onclick={connectMetamask}>
                Connect Metamask
            </button>

            <span>|</span>
            <button
                title="Coming soon"
                style="font-size: 14px; background-color:#ccc;padding:6px;border-radius:5px;border:1px solid gray"
                type="button"
                disabled
                onclick={connectMetamask}>
                Connect Solana
            </button>
        {/if}
    </div>
    <p style="font-size:12px; margin-bottom:5px;color:darkgreen" class:hidden={!walletConnected}>
        Wallet Address: <code>{activeAddress}</code>
    </p>
    <hr />

    {#if undernames.length > 0}
        <table
            style="font-size:12px;background-color:#bbdefb;width:100%;border:1px solid #ddd;border-collapse:collapse;">
            <caption style="font-size: 14px;"><strong>Your undernames</strong> (Max 5 Free)</caption>
            <thead>
                <tr style="background:#f5f5f5">
                    <th style="padding:4px;text-align:center;border:1px solid #ddd">Undername</th>
                    <th style="padding:4px;text-align:center;border:1px solid #ddd">Linktree Id</th>
                    <th style="padding:4px;text-align:center;border:1px solid #ddd">Edit</th>
                    <th style="padding:4px;text-align:center;border:1px solid #ddd">Delete</th>
                </tr>
            </thead>
            <tbody>
                {#each undernames as undername}
                    <tr>
                        <td style="padding:4px;border:1px solid #ddd"><a href="https://{undername.undername}_linktree.{gatewayDomainName}" target="_blank">{undername.undername}</a></td>
                        <td style="padding:4px;border:1px solid #ddd">{undername.target}</td>
                        <td style="padding:4px;border:1px solid #ddd">🖉</td>
                        <td style="padding:4px;border:1px solid #ddd"><button onclick={()=>removeUndername(undername.undername)}>✖</button></td>
                    </tr>
                {/each}
            </tbody>
        </table>
        {#if isRemoving}
        <div>removing undername, waiting...</div>       
        {/if}
    {:else if !walletConnected}
        <div>Connect wallet to fetch your undernames.</div>
    {:else if isFetchingUndername}
        <div>Fetching your undernames...</div>
    {:else}
        <div>You have not submitted any undername yet.</div>
    {/if}
    <hr />
    <div style="font-size: 14px; font-weight:bolder">Publish new undername</div>

    {#if antWarning}
        <div style="color:orangered;margin:10px">Warning: ANT service is unvailable now, refresh or try it later.</div>
    {:else}
        <div style="background-color: #bbdefb;padding:10px; font-size:14px">
            <div>
                <label for="custom_text">Linktree Id</label>
                <input
                    type="text"
                    style="width: 350px;margin-bottom:5px;font-size:12px"
                    id="custom_text"
                    placeholder="Enter you Linktree Id"
                    bind:value={linktreeId}
                    disabled={!enableCustomId}
                    />
                <button onclick={()=>{enableCustomId=true}} title="You can input your custom txid from arweave" class:hidden={enableCustomId}>Customize</button>
            </div>
            <div>
                <label for="custom_text">UnderName</label>
                <input
                    type="text"
                    style="width: 150px;margin-bottom:5px"
                    id="custom_text"
                    placeholder="Enter you undername"
                    bind:value={undername}
                    onkeydown={onUnderNameChanged} />
                <button onclick={checkName}>Check Validity</button>     

                <span style="font-size:12px;color:coral" class:hidden={!isChecking}>🛑 checking</span>
                
                {#if checked}
                <span style="font-size:12px" class:hidden={!showAvialableResult}>
                    <span style="font-size:12px;color:darkgreen" class:hidden={!nameAvailable}>
                        ✔ {undername} is available
                    </span>
                    <span style="font-size:12px;color:darkorange" class:hidden={nameAvailable}>
                        ✖ {undername} is taken
                    </span>
                </span>
                <span style="font-size:12px;color:darkred" class:hidden={isCharValid}>⚠invalid character</span>
                <span style="font-size:12px;color:darkred" class:hidden={isLinktreeIdValid}>⚠invalid Linktree Id</span>
                {/if}
            </div>
            <div style="font-size:12px;color:darkgreen">
                Publish <code>{linktreeId}</code>
                to
                <code>{undername}_linktree.{gatewayDomainName}</code>
            </div>
            <div>
                <button  disabled={!canPublish}  onclick={publish}         >
                    {#if walletConnected}
                        {#if isUndernameValid }
                        <span>Publish {undername}</span>
                        {:else}
                        <span>Check Validity Before Publishing</span>
                        {/if}
                    {:else}
                        <span>Connect Wallet Before Publishing</span>
                    {/if}                    
                </button>
                <div class:hidden={!showPublish}>
                    <p style="color:darkblue" class:hidden={!isAoSending}>
                        <!--正在发往AO处理域名解析事项...-->
                        Sending to AO to handle undername resolution...
                    </p>
                    <p style="color:darkorange" class:hidden={!showFail}>
                        <!--AO处理过程中遇到问题，请稍候再试-->
                        We encountered an issue during the AO processing. Please try again later.
                    </p>
                    <div style="color:darkgreen" class:hidden={!showSuccess}>
                        <!-- 解析undername到生效需要一些时间，请过些时间访问你的linktree域名或到本页查看结果-->
                        <div><strong>Congratulations！your undername has been successfully published.</strong></div>
                        <p>
                        It may take some time to resolve the undername until it takes effect. Please visit your linktree
                        (https://{undername}_linktree.{gatewayDomainName}) or check the results on this page later.
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
