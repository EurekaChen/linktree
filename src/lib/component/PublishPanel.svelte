<script>
  import { onMount } from "svelte";
  import { createDataItemSigner, dryrun, message, result } from "@permaweb/aoconnect";
    import { getGatewayDomainName } from "$lib/getGatewayDomainName";

  let gatewayDomainName = $state("ar.io");
  if (typeof window !== "undefined") {
    gatewayDomainName = getGatewayDomainName();
  }

  let walletConnected = $state(false);
  let antWarning = $state(true);

  let nameAvailable = $state(false);

  let undername=$state("demo");

  let showAvialableCheck = $state(false);
  let showAlphabetOnly = $state(false);
  let isChecking = $state(false);
  let underNameChanged = $state(false);

  let showPublish = $state(false);
  let isAoSending = $state(false);
  let showSuccess = $state(false);
  let showFail = $state(false);

  let linktreeId = $state("4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y"); //这是demo的id
  if (typeof window !== "undefined") {
  let getlinktreeId = localStorage.getItem("linktreeId");
  if (getlinktreeId) {
    linktreeId = getlinktreeId;  
  }
}

  function onUnderNameChanged() {
    underNameChanged = true;
    isChecking = false;
    showAvialableCheck = false;
    showAlphabetOnly = false;
    nameAvailable = true;
  }

  async function checkName() {
    isChecking = true;
    showSuccess = false;
    showFail = false;
    const regex = /^[a-z0-9-]+$/; // 允许字母和连字符
    let valid = regex.test(undername);
    if (valid) {
      //检查是否可用
      showAvialableCheck = false;
      const { ANT } = await import("@ar.io/sdk/web");
      const ant = ANT.init({ processId: "gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk" });
      const records = await ant.getRecords();
      if (undername in records) {
        nameAvailable = false;
      } else {
        nameAvailable = true;
        localStorage.setItem("undername", undername);
      }
      showAvialableCheck = true;
    } else {
      showAlphabetOnly = true;
    }
    isChecking = false;
    underNameChanged = false;
  }

  let activeAddress;
  async function connectWallet() {
    try {
      await window.arweaveWallet.connect([
        "ACCESS_ADDRESS",
        "ACCESS_PUBLIC_KEY",
        "SIGN_TRANSACTION"
      ]);
      walletConnected = true;
      activeAddress = await window.arweaveWallet.getActiveAddress();
      //connected(activeAddress);
      //获取已经有的undername
      let getPlayerMsg = await dryrun({
        process: "GhMUqZB7qFf9iJ5myIsJJkeFH8CN9QeOQjJoLvhHV5E",
        tags: [{ name: "Action", value: "GetUser" }],
        data: activeAddress
      });

      //是否查询到玩家信息
      if (getPlayerMsg.Messages.length > 0) {
        //
        //return JSON.parse(getPlayerMsg.Messages[0].Data);
      } else {
        //return null;
      }
    } catch (error) {
      console.log("Connect error:", error);
      walletConnected = false;
    }
  }

  async function disconnectWallet() {
    try {
      // 请求断开 ArConnect 钱包
      await window.arweaveWallet.disconnect();
      walletConnected = false;
    } catch (error) {
      console.error("Failed to disconnect from ArConnect wallet", error);
    }
  }

  async function publish() {
    //发到AO进行发布

    showPublish = true;
    isAoSending = true;
    const undernameProcessId = "GhMUqZB7qFf9iJ5myIsJJkeFH8CN9QeOQjJoLvhHV5E";
    const msgId = await message({
      process: undernameProcessId,
      tags: [
        { name: "Action", value: "Add" },
        { name: "Undername", value: undername },
        { name: "Target", value: linktreeId }
      ],
      signer: createDataItemSigner(window.arweaveWallet),
      data: "linktree"
    });
    console.log("toAoMsgId:", msgId);

    const readResult = await result({ message: msgId, process: undernameProcessId });
    let reply = readResult.Messages[0].Data;
    isAoSending = false;
    if (reply == "success") {
      showSuccess = true;
      showFail = false;
    } else {
      showFail = true;
      showSuccess = false;
    }
  }

  onMount(async () => {
    //获取当前网关域名
    gatewayDomainName = getGatewayDomainName();   

    //获取之前设置的undername
    const storageUndername = localStorage.getItem("undername");
    if (storageUndername) {
      undername = storageUndername;
    }

    let getlinktreeId = localStorage.getItem("linktreeId");
    if (getlinktreeId) {
      linktreeId = getlinktreeId;     
    }

    console.log(document.styleSheets);

    // 获取linktree记录信息
    //const io = IO.init();
    //const record = await io.getArNSRecord({ name: 'linktree' });
    //12345678:vDeH1apk0WMyMFCBH1W76D2-8tZG2hstwFNZJqYZUGA
    //linktree:gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk

    (async () => {
      try {
        const module = await import("@ar.io/sdk/web");
        const ANT = module.ANT;
        const ant = ANT.init({ processId: "gJKH_MlxgDI3j912HdppmuJnqzsSvo3nRuvb5PVPxOk" });
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
      <button style="font-size: 14px; color:darkblue" type="button" onclick={disconnectWallet}
        >Disconnect</button
      >
    {:else}
      <button
        title="Connect wallet to publish undername"
        style="font-size: 14px; color:darkblue"
        type="button"
        class="btn btn-primary"
        onclick={connectWallet}>Connect AR Wallet</button
      >
    {/if}
  </div>
  <hr />
  <table
    style="font-size:12px;background-color:#bbdefb;width:100%;border:1px solid #ddd;border-collapse:collapse;"
  >
    <caption style="font-size: 14px;"><strong>Your undernames</strong></caption>
    <thead>
      <tr style="background:#f5f5f5">
        <th style="padding:4px;text-align:center;border:1px solid #ddd">Undername</th>
        <th style="padding:4px;text-align:center;border:1px solid #ddd">Linktree Id</th>
        <th style="padding:4px;text-align:center;border:1px solid #ddd">Edit</th>
        <th style="padding:4px;text-align:center;border:1px solid #ddd">Delete</th>
      </tr></thead
    >
    <tbody>
      <tr>
        <td style="padding:4px;border:1px solid #ddd">{undername}</td>
        <td style="padding:4px;border:1px solid #ddd"
          >4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y
        </td>
        <td style="padding:4px;border:1px solid #ddd">🖉</td>
        <td style="padding:4px;border:1px solid #ddd">✖</td>
      </tr>
      <tr>
        <td style="padding:4px;border:1px solid #ddd">emily</td>
        <td style="padding:4px;border:1px solid #ddd">
          IVbHJBVdBEzv_90VUS19f2NTps-fHDG1a7a9LX-Lg8g
        </td>
        <td style="padding:4px;border:1px solid #ddd">🖉</td>
        <td style="padding:4px;border:1px solid #ddd">✖</td>
      </tr>
    </tbody>
  </table>
  <hr />
  <div style="font-size: 14px; font-weight:bolder">Publish new undername</div>

  <div class:hidden={antWarning} style="background-color: #bbdefb;padding:10px; font-size:14px">
    <div>
      <label for="custom_text">Linktree Id</label>
      <input
        type="text"
        style="width: 350px;margin-bottom:5px"
        id="custom_text"
        placeholder="Enter you Linktree Id"
        bind:value={linktreeId}
      />
    </div>
    <div>
      <label for="custom_text">UnderName</label>
      <input
        type="text"
        style="width: 150px;margin-bottom:5px"
        id="custom_text"
        placeholder="Enter you undername"
        bind:value={undername}
        onkeydown={onUnderNameChanged}
      />
      <button onclick={checkName}>Check Validity</button>
      <span style="font-size:12px;color:coral" class:hidden={!isChecking}> 🛑 checking</span>
      <span style="font-size:12px" class:hidden={!showAvialableCheck}>
        <span style="font-size:12px;color:darkgreen" class:hidden={!nameAvailable}>
          ✔ {undername} is available</span
        >
        <span style="font-size:12px;color:darkorange" class:hidden={nameAvailable}>
          ✖ {undername} is taken</span
        >
      </span>
      <span style="font-size:12px;color:darkred" class:hidden={!showAlphabetOnly}
        >⚠invalid character</span
      >
    </div>
    <div style="font-size:12px;color:darkgreen">
      Publish <code>{linktreeId}</code> to <code>{undername}_linktree.{gatewayDomainName}</code>
    </div>
    <div class:hidden={underNameChanged || showAlphabetOnly}>
      <button
        class:hidden={!nameAvailable}
        disabled={!walletConnected}
        onclick={publish}
        title="connect wallet to publish"
        ><span class:hidden={!walletConnected}>Publish</span><span class:hidden={walletConnected}
          >Connect Wallet Before Publishing</span
        >
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
        <p style="color:darkgreen" class:hidden={!showSuccess}>
          <!-- 解析undername到生效需要一些时间，请过些时间访问你的linktree域名或到本页查看结果-->
          It will take some time to resolve the undername until it takes effect. Please visit your linktree
          (https://{undername}_linktree.{gatewayDomainName}) or check the results on this page
          later.
        </p>
      </div>
    </div>
  </div>
  <div style="color:orangered;margin:10px" class:hidden={!antWarning}>
    Warning: ANT service is unvailable now, refresh or try it later.
  </div>
</div>
