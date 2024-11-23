<script lang="ts">
    import preset from "./preset.json";
    import defaultLinktreeImport from "./defaultLinktree.json";

    import { t, locales, locale } from "$lib/i18n";

    import { getGatewayDomainName } from "$lib/getGatewayDomainName";
    import { defaultGatewayDomainName, linktreeAntId } from "$lib/constant";
    import { log } from "$lib/store/Debug";

    import UploadPanel from "$lib/component/UploadPanel.svelte";
    import PublishPanel from "$lib/component/PublishPanel.svelte";

    import { onMount } from "svelte";

    log("Start");

    //使用去中心化域名
    // svelte-ignore non_reactive_update
    let gatewayDomainName = defaultGatewayDomainName;
    if (typeof window !== "undefined") {
        gatewayDomainName = getGatewayDomainName();
    }
    log("当前网关：", gatewayDomainName);

    //根据当前域名调整相关链接
    let defaultLinktree;
    (async () => {
        let json = $t("main.defaultLinktreeJson") as string;
        json="/json/"+(json);
        try {
            const response = await fetch(json);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            defaultLinktree = await response.json();
        } catch (error) {
            console.error("获取默认链接树数据失败:", error);
            // 可以设置一个默认值
            defaultLinktree = defaultLinktreeImport;
        }
    })();
    let linktree = $state(defaultLinktree);
    let defaultLinktreeJson = JSON.stringify(defaultLinktree);
    let newDefaultLinktreeJson = defaultLinktreeJson.replaceAll(defaultGatewayDomainName, gatewayDomainName);

    linktree = JSON.parse(newDefaultLinktreeJson);
    let undername = $state("demo");
    if (typeof window !== "undefined") {
        (async () => {
            const params = new URLSearchParams(window.location.search);
            const forkUndername = params.get("fork"); //?fork=eureka
            if (forkUndername) {
                const forkUrl = "https://" + forkUndername + "_linktree." + gatewayDomainName;
                const response = await fetch(forkUrl);
                const htmlText = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlText, "text/html");
                const jsonElement = doc.getElementById("linktreeJson");
                if (jsonElement?.textContent) {
                    linktree = JSON.parse(jsonElement.textContent);
                    localStorage.setItem("linktree", jsonElement.textContent);
                }
            }
        })();

        //获取之前保存的linktree
        const storageLinktree = localStorage.getItem("linktree");
        console.log("获取到本地内存缓存数据", storageLinktree);
        if (storageLinktree) {
            linktree = JSON.parse(storageLinktree);
        }

        //获取之前设置的undername
        const storageUndername = localStorage.getItem("undername");
        if (storageUndername) {
            undername = storageUndername;
        }
    }

    let linktreeId = $state("Get linktree Id by upload page to arweave"); //这是demo的id,4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y

    let root = "https://linktree." + gatewayDomainName;

    let isLogoEditing = $state(false);
    let isLinkAdding = $state(false);

    let isPublishUndername = $state(false);

    let selectedPreset = $state(preset[0]);
    let addLinkClass = $state(preset[0].buttonClass);
    let addLinkIcon = $state(root + "/img/icon/" + preset[0].icon);
    let addLinkText = $state(preset[0].text);
    let addLinkUrl = $state(root);

    let uploadEnabled = $state(false);
    let showLinktreeId = $state(false);

    function save() {
        localStorage.setItem("linktree", JSON.stringify(linktree));
        showLinktreeId = false;
        uploadEnabled = true;
        localStorage.removeItem("linktreeId");
        log("保存新的linktree,并移除旧的linktreeId");
    }

    function deleteLink(index: number) {
        linktree.links.splice(index, 1);
        save();
    }

    function onSelectChange() {
        addLinkClass = selectedPreset.buttonClass;
        addLinkIcon = root + "/img/icon/" + selectedPreset.icon;
        addLinkText = selectedPreset.text;
    }

    function addLink() {
        let item = { class: addLinkClass, icon: addLinkIcon, text: addLinkText, url: addLinkUrl };
        linktree.links.push(item);
        save();
    }

    let undernameReady = $state(false);
    onMount(async () => {
        //获取linktree记录信息
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
                    undernameReady = true;
                } else {
                    undernameReady = false;
                }
            } catch (error) {
                console.error("导入失败ANT:", error);
            }
        })();
    });
</script>

<img src={linktree.logo} class="avatar" srcset="{linktree.logo} 2x" alt={linktree.title} />

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
    }}>
    🖉
</span>
<div style="font-size: 14px;" class:hidden={!isLogoEditing}>
    <label for="class">Enter Logo Url</label>
    <input
        id="href"
        style="width:350px"
        type="text"
        placeholder="Enter Logo URL"
        title="you can upload your logo to arweave"
        bind:value={linktree.logo} />
    <span
        title="confirm"
        role="button"
        tabindex="0"
        style="font-size:1em;color:green;font-weight:bolder"
        aria-label="confirm logo url"
        class:hidden={!isLogoEditing}
        onkeydown={() => {
            isLogoEditing = false;
            uploadEnabled = true;
        }}
        onclick={() => {
            isLogoEditing = false;
            uploadEnabled = true;
        }}>
        ✓
    </span>
</div>

<!-- Title -->
<div>
    <h1 style="display: inline;" contenteditable="true" bind:textContent={linktree.title} onblur={save}></h1>
</div>
<!--Description-->
<p contenteditable="true" bind:textContent={linktree.description} onblur={save}></p>

{#each linktree.links as link, index}
    <a class="button button-{link.class}" href={link.url} target="_blank" rel="noopener" role="button">
        <img class="icon" aria-hidden="true" src={link.icon} alt={link.text} />
        {link.text}
    </a>
    <span
        title="delete"
        role="button"
        tabindex="0"
        onkeydown={() => deleteLink(index)}
        style="color:red;vertical-align:super"
        onclick={() => deleteLink(index)}>
        ✖
    </span>
{/each}

<hr />
<button
    class:hidden={isLinkAdding}
    onclick={() => {
        isLinkAdding = true;
    }}>
    + Add Custom Link
</button>
<br />

<div style="border:1px solid gray;padding:8px; background-color:#e3f2fd;border-radius:4px" class:hidden={!isLinkAdding}>
    <div style="text-align: right;">
        <span
            role="button"
            tabindex="0"
            onkeydown={() => {
                isLinkAdding = false;
            }}
            onclick={() => {
                isLinkAdding = false;
            }}>
            ✖close
        </span>
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
            bind:value={addLinkIcon} />
    </div>
    <div>
        <label for="custom_text">Text</label>
        <input
            class="form-control"
            type="text"
            placeholder="Enter Your Link Text Or Keep Default"
            bind:value={addLinkText} />
    </div>
    <div>
        <label for="custom_text">Link</label>
        <input class="form-control" type="text" placeholder="Enter Your Link URL" bind:value={addLinkUrl} />
    </div>

    <a class="button button-{addLinkClass}" href={addLinkUrl} target="_blank" rel="noopener" role="button">
        <img class="icon" aria-hidden="true" src={addLinkIcon} alt="" />
        {addLinkText}
    </a>
    <br />
    <button type="submit" onclick={addLink}>Add Link</button>
    <br />
</div>
<hr />
<UploadPanel bind:showLinktreeId bind:uploadEnabled bind:linktreeId />
<hr />
<button
    class:hidden={isPublishUndername}
    onclick={() => {
        isPublishUndername = true;
    }}>
    Publish Undername
</button>
<br />

<div
    style="border:1px solid gray;padding:14px; background-color:#e3f2fd;border-radius:4px"
    class:hidden={!isPublishUndername}>
    <div style="text-align: right;">
        <span
            role="button"
            tabindex="0"
            onkeydown={() => {
                isPublishUndername = false;
            }}
            onclick={() => {
                isPublishUndername = false;
            }}>
            ✖close
        </span>
    </div>
    <PublishPanel {linktreeId} />
</div>
<hr />
<div class:hidden={!undernameReady}>
    <strong style="color:green">{undername} is ready!</strong>
    vist
    <code>
        <a style="text-decoration: none;" href="https://{undername}_linktree.{gatewayDomainName}">
            https://{undername}_linktree.{gatewayDomainName}
        </a>
    </code>
    or
    <code><a style="text-decoration: none;" href="/gateway?undername={undername}">more domain names</a></code>
</div>
<hr />
<div style="font-size: 14px;">
    <span role="img" aria-label="Choose Language">🌐{$t("chooseLanguage")}</span>
    <select bind:value={$locale}>
        {#each $locales as value}
            <option {value}>{$t(`lang.${value}`)}</option>
        {/each}
    </select>
</div>

<style>
    .hidden {
        display: none;
    }
    .form-control {
        width: 350px;
    }
</style>
