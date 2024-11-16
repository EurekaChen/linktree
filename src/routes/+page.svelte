<script lang="ts">
  import PublishPanel from "$lib/component/PublishPanel.svelte";
  import preset from "./preset.json";
  import { onMount } from "svelte"; 
  //严重怀疑这个库问题导至刷新出错！！或者跟网络也有关系！一开始暂不导入
  //import { ANT } from '@ar.io/sdk/web';

  import { upload } from "$lib/upload";
  import { getGatewayDomainName } from "$lib/getGatewayDomainName";

  let isLogoEditing = $state(false);
  let isLinkAdding = $state(false);

  let isUploading = $state(false);
  let showLinktreeId = $state(false);
  let uploadFailed = $state(false);

  let uploadEnabled = $state(false);

  let isPublishUndername = $state(false);

  let undername = $state("demo"); //onmount中改变
  let linktreeId = $state("4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y"); //demo
  let nameAvailable = $state(false);

  let defaultGatewayDomainName = "ar.io";

  let defaultRoot = "https://linktree." + defaultGatewayDomainName;

  let defaultIconRoot = defaultRoot + "/img/icon/";
  //let defaultIconRoot = 'https://dl.eeurl.com/svg/icon/brand/';

  //默认数据，没有保存时使用
  let deaultData = {
    title: "AR Link Tree",
    logo: "https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780",
    description:
      "You can directly edit this page and permanently publish it to Arweave, then accessing your linktree page through the ArNS",
    links: [
      {
        class: "default",
        url: defaultRoot,
        icon: defaultIconRoot + "generic-website.svg",
        text: "Visit Website"
      },
      {
        class: "github",
        url: "https://github.com/eurekachen",
        icon: defaultIconRoot + "github.svg",
        text: "GitHub"
      },
      {
        class: "pinterest",
        url: "https://www.pinterest.com/eureka2093",
        icon: defaultIconRoot + "pinterest.svg",
        text: "Pinterest"
      },
      {
        class: "discord",
        url: "https://discord.com",
        icon: defaultIconRoot + "discord.svg",
        text: "Discord"
      },
      {
        class: "linked",
        url: "https://linkedin.com",
        icon: defaultIconRoot + "linkedin.svg",
        text: "LinkedIn"
      }
    ]
  };

  let gatewayDomainName = $state(defaultGatewayDomainName);
  let data = $state(deaultData);
  let iconRoot = $state(defaultIconRoot);
  onMount(async () => {
    //获取当前网关域名
    gatewayDomainName = getGatewayDomainName();

    //获取之前保存的数据
    const storageData = localStorage.getItem("data");
    console.log("获取到本地内存缓存数据", storageData);
    if (storageData) {
      data = JSON.parse(storageData);
    }

    //获取之前设置的undername
    const storageUndername = localStorage.getItem("undername");
    if (storageUndername) {
      undername = storageUndername;
    }

    let getlinktreeId = localStorage.getItem("linktreeId");
    if (getlinktreeId) {
      linktreeId = getlinktreeId;
      showLinktreeId = true;
    }

    console.log(document.styleSheets);
  });

  let selectedPreset = $state(preset[0]);
  let addLinkClass = $state(preset[0].buttonClass);
  let addLinkIcon = $state(defaultIconRoot + preset[0].icon);
  let addLinkText = $state(preset[0].text);
  let addLinkUrl = $state(defaultRoot);

  function save() {
    localStorage.setItem("data", JSON.stringify(data));
    showLinktreeId = false;
    uploadEnabled = true;
    console.log("saved:" + localStorage.getItem("data"));
  }

  function deleteLink(index: number) {
    data.links.splice(index, 1);
    save();
  }

  function onSelectChange() {
    addLinkClass = selectedPreset.buttonClass;
    addLinkIcon = iconRoot + selectedPreset.icon;
    addLinkText = selectedPreset.text;
  }

  function addLink() {
    let item = { class: addLinkClass, icon: addLinkIcon, text: addLinkText, url: addLinkUrl };
    data.links.push(item);
    save();
  }

  async function turboUpload() {
    isUploading = true;
    showLinktreeId = false;
    linktreeId = await upload();
    if (linktreeId == "failed") {
      isUploading = false;
      uploadFailed = true;
      showLinktreeId = false;
    } else {
      isUploading = false;
      showLinktreeId = true;
      localStorage.setItem("linktreeId", linktreeId);
    }
  }
</script>

<img src={data.logo} class="avatar" srcset="{data.logo} 2x" alt={data.title} />

<span
  title="editlogo"
  role="button"
  tabindex="0"
  style="font-size:1em;vertical-align:30px;width:30px;heigt:30px"
  aria-label="edit logo url"
  class:hidden={isLogoEditing}
  onkeydown={() => {
    isLogoEditing = true;
  }}
  onclick={() => {
    isLogoEditing = true;
  }}>🖉</span
>
<div style="font-size: 14px;" class:hidden={!isLogoEditing}>
  <label for="class">Enter Logo Url</label>
  <input
    id="href"
    style="width:350px"
    type="text"
    placeholder="Enter Logo URL"
    title="you can upload your logo to arweave"
    bind:value={data.logo}
  />
  <span
    title="confirm"
    role="button"
    tabindex="0"
    style="font-size:1em;color:green;font-weight:bolder"
    aria-label="confirm logo url"
    class:hidden={!isLogoEditing}
    onkeydown={() => {
      isLogoEditing = false;
    }}
    onclick={() => {
      isLogoEditing = false;
    }}>✓</span
  >
</div>

<!-- Title -->
<div>
  <h1
    style="display: inline;"
    contenteditable="true"
    bind:textContent={data.title}
    onblur={save}
  ></h1>
</div>
<!--Description-->
<p contenteditable="true" bind:textContent={data.description} onblur={save}></p>

{#each data.links as link, index}
  <a class="button button-{link.class}" href={link.url} target="_blank" rel="noopener" role="button"
    ><img class="icon" aria-hidden="true" src={link.icon} alt={link.text} />{link.text}</a
  >
  <span
    title="delete"
    role="button"
    tabindex="0"
    onkeydown={() => deleteLink(index)}
    style="color:red;vertical-align:super"
    onclick={() => deleteLink(index)}>✖</span
  >
{/each}

<hr />
<button
  class:hidden={isLinkAdding}
  onclick={() => {
    isLinkAdding = true;
  }}>+ Add Custom Link</button
>
<br />

<div
  style="border:1px solid gray;padding:8px; background-color:#e3f2fd;border-radius:4px"
  class:hidden={!isLinkAdding}
>
  <div style="text-align: right;">
    <span
      role="button"
      tabindex="0"
      onkeydown={() => {
        isLinkAdding = false;
      }}
      onclick={() => {
        isLinkAdding = false;
      }}
    >
      ✖close</span
    >
  </div>
  <br />
  <div>
    <label for="class">Preset</label>
    <select id="class" class="form-control" bind:value={selectedPreset} onchange={onSelectChange}>
      {#each preset as item}
        <option value={item}>
          {item.name}
        </option>
      {/each}
    </select>
  </div>

  <div>
    <label for="custom_icon">Icon</label>
    <input
      class="form-control"
      type="text"
      placeholder="Enter Your Icon URL OR Keep Default"
      bind:value={addLinkIcon}
    />
  </div>
  <div>
    <label for="custom_text">Text</label>
    <input
      class="form-control"
      type="text"
      placeholder="Enter Your Link Text Or Keep Default"
      bind:value={addLinkText}
    />
  </div>
  <div>
    <label for="custom_text">Link</label>
    <input
      class="form-control"
      type="text"
      placeholder="Enter Your Link URL"
      bind:value={addLinkUrl}
    />
  </div>

  <a
    class="button button-{addLinkClass}"
    href={addLinkUrl}
    target="_blank"
    rel="noopener"
    role="button"><img class="icon" aria-hidden="true" src={addLinkIcon} alt="" />{addLinkText}</a
  >
  <br />
  <button type="submit" onclick={addLink}>Add Link</button>
  <br />
</div>
<hr />
<button
  disabled={!uploadEnabled}
  title="Modify this page to active this button"
  onclick={turboUpload}>Upload this linktree page to Arweave</button
>
<p style="font-size: 12px;margin-bottom:5px;" class:hidden={!isUploading}>
  Upload your linktree to Arweave...
</p>
<p style="font-size:12px; margin-bottom:5px;color:darkgreen" class:hidden={!showLinktreeId}>
  Link Tree ID:{linktreeId}
</p>
<p style="font-size:12px; margin-bottom:5px;color:darkred" class:hidden={!uploadFailed}>
  Upload to Arweave Failed, try it layter.
</p>
<hr />
<button
  class:hidden={isPublishUndername}
  onclick={() => {
    isPublishUndername = true;
  }}>Publish Undername</button
>
<br />

<div
  style="border:1px solid gray;padding:14px; background-color:#e3f2fd;border-radius:4px"
  class:hidden={!isPublishUndername}
>
  <div style="text-align: right;">
    <span
      role="button"
      tabindex="0"
      onkeydown={() => {
        isPublishUndername = false;
      }}
      onclick={() => {
        isPublishUndername = false;
      }}
    >
      ✖close</span
    >
  </div>
  <PublishPanel />
</div>
<hr />
<div class:hidden={nameAvailable}>
  <strong style="color:green">{undername} is ready! </strong> vist
  <code>
    <a style="text-decoration: none;" href="https://{undername}_linktree.{gatewayDomainName}"
      >https://{undername}_linktree.{gatewayDomainName}</a
    ></code
  >
  or
  <code
    ><a style="text-decoration: none;" href="/gateway?undername={undername}">more domain names</a
    ></code
  >
</div>
<hr />

<style>
  .hidden {
    display: none;
  }
  .form-control {
    width: 350px;
  }
</style>
