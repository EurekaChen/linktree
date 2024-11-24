<script lang="ts">
    import { t, locales, locale } from "$lib/i18n";
    import { log } from "$lib/store/Debug";
    import { onMount } from "svelte";

    let domain = "hello_linktree";
    let isChecking = $state(false);
    //let title = $state($t("gateway.gatewayAvailabilityCheck"));
    let title=""; //$t("gateway.gatewayAvailabilityCheck");
    let description = $state("");

    const namePattern = /^(?:[a-zA-Z0-9_-]+)$/; //名称允许字符，字母和连字符和下划线（来自ar.iob除去@)

    if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);

        const undername = params.get("undername"); //?undername=eureka
        if (undername && namePattern.test(undername)) {
            title = undername;
            domain = undername + "_linktree";
            description =
                $t("gateway.byGateway") +
                '<code><a href="https://' +
                domain +
                ".ar.io" +
                '">' +
                domain +
                ".ar.io</a></code>";
        }

        const name = params.get("name"); //?name=eeeeee
        if (name && namePattern.test(name)) {
            title = name;
            domain = name;
            description =
                $t("gateway.byGateway") +
                '<code><a href="https://' +
                domain +
                ".ar.io" +
                '">' +
                domain +
                ".ar.io</a></code>";
        }
    }

    interface Gateway {
        label: string;
        fqdn: string;
        protocol: string;
        stake: number;
        startTime: string;
        state: string;
        delay: number;
    }

    interface LeavingGateway {
        label: string;
        fqdn: string;
        protocol: string;
        stake: number;
        startTime: string;
    }

    let gateways = $state<Gateway[]>([]);

    let leavingGateways = $state<LeavingGateway[]>([]);
    let isIOError = $state(false);
    let ioError = $state({});

    async function fetchGateways() {
        try {
            log("获取网关中...");
            const module = await import("@ar.io/sdk/web");
            const IO = module.IO;
            const io = IO.init();
            const result = await io.getGateways({
                limit: 1000,
                sortOrder: "asc",
                sortBy: "settings.fqdn"
            });

            for (let item of result.items) {
                if (item.status == "leaving") {
                    let leaving = {
                        label: item.settings.label,
                        fqdn: item.settings.fqdn,
                        protocol: item.settings.protocol,
                        stake: Math.round(item.operatorStake / 10000000) / 100,
                        startTime: new Date(item.startTimestamp).toLocaleDateString()
                    };
                    leavingGateways.push(leaving);
                } else {
                    let gateway = {
                        label: item.settings.label,
                        fqdn: item.settings.fqdn,
                        protocol: item.settings.protocol,

                        stake: Math.round(item.operatorStake / 10000000) / 100,
                        status: item.status,
                        startTime: new Date(item.startTimestamp).toLocaleDateString(),
                        state: $t("gateway.check"),
                        delay: 0
                    };
                    gateways.push(gateway);
                }
            }
            log(gateways);
        } catch (error) {
            isIOError = true;
            ioError = error as Record<string, unknown>;
        }
    }

    onMount(() => {
        fetchGateways();
    });

    const helloText = "<h1>Hello, Eureka World!</h1>";
    let checked = $state(0);
    async function checkGateways() {
        isChecking = !isChecking;
        checked = 0;
        for (let gateway of gateways) {
            if (!isChecking) return;
            await checkGateway(gateway);
            checked++;
        }
    }

    async function checkGateway(gateway: Gateway) {
        gateway.state = $t("gateway.checking");
        const startTime = performance.now();
        try {
            let url = gateway.protocol + "://" + domain + "." + gateway.fqdn;
            const response = await fetch(url, { cache: "no-store" });
            if (response.ok) {
                if (domain == "hello_linktree") {
                    const fetchText = await response.text(); // 将响应体解析为文本返回
                    const matched = fetchText == helloText;
                    if (matched) {
                        gateway.state = $t("gateway.gatewayOk");
                    } else {
                        gateway.state = $t("gateway.gatewayOk");
                    }
                } else {
                    gateway.state = $t("gateway.visitOk");
                }
            } else {
                gateway.state = "<span>" + "✅" + response.status + "</span>";
            }
        } catch (error) {
            let errorMsg: string = error instanceof Error ? error.message : $t("gateway.unknownError");
            gateway.state = '<span  title="' + errorMsg + '">' + $t("gateway.gatewayFail") + "</span>";
        }

        const endTime = performance.now();
        const delay = endTime - startTime;
        gateway.delay = Math.round(delay) / 1000;
    }

    // 排序状态
    let sortState = $state({
        column: "fqdn",
        asc: true
    });

    // 排序函数
    function sortData(column: string) {
        if (sortState.column === column) {
            // 切换排序方向
            sortState.asc = !sortState.asc;
        } else {
            // 切换到新列，默认升序
            sortState.column = column;
            sortState.asc = true;
        }

        // 根据当前排序状态对数据进行排序
        if (sortState.asc) {
            gateways.sort((a, b) => (a[column as keyof Gateway] > b[column as keyof Gateway] ? 1 : -1));
        } else {
            gateways.sort((a, b) => (a[column as keyof Gateway] < b[column as keyof Gateway] ? 1 : -1));
        }
    }
</script>

<img
    src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780"
    class="avatar"
    srcset="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780 2x"
    alt="Gateways" />
<div style="font-size: 14px;">
    <span role="img" aria-label="Choose Language">🌐{$t("chooseLanguage")}</span>
    <select bind:value={$locale} style="margin-bottom: 0px;">
        {#each $locales as value}
            <option {value}>{$t(`lang.${value}`)}</option>
        {/each}
    </select>
</div>

<h2>{title} {$t("gateway.gatewayAvailabilityCheck")}</h2>

{#if gateways.length > 0}
    <!-- <p>{@html description}</p> -->
    <button onclick={checkGateways}>{isChecking ? $t("gateway.stopChecking") : $t("gateway.checkAll")}</button>
    <p style="font-size:14px">
        <span>{$t("gateway.totalJoined")} <strong> {gateways.length} </strong> ({$t("gateway.delayNote")})</span>
        <span class:hidden={!isChecking}>
            {$t("gateway.checkCount")}
            <strong>{checked}</strong>
        </span>
    </p>
    <table aria-label="Gateway List">
        <thead>
            <tr>
                <th>
                    {$t("gateway.fqdn")}
                    <button onclick={() => sortData("fqdn")}>
                        {#if sortState.column === "fqdn"}
                            {#if sortState.asc}
                                🔼
                            {:else}
                                🔽
                            {/if}
                        {:else}
                            ↕️
                        {/if}
                    </button>
                </th>
                <th>
                    {$t("gateway.joinDate")}
                    <button onclick={() => sortData("startTime")}>
                        {#if sortState.column === "startTime"}
                            {#if sortState.asc}
                                🔼
                            {:else}
                                🔽
                            {/if}
                        {:else}
                            ↕️
                        {/if}
                    </button>
                </th>
                <th>
                    {$t("gateway.stakeIO")}
                    <button onclick={() => sortData("stake")}>
                        {#if sortState.column === "stake"}
                            {#if sortState.asc}
                                🔼
                            {:else}
                                🔽
                            {/if}
                        {:else}
                            ↕️
                        {/if}
                    </button>
                </th>
                <th>{$t("gateway.visitLink")}</th>
                <th>{$t("gateway.availabilityCheck")}</th>
                <th>
                    {$t("gateway.checkDelay")}
                    <button onclick={() => sortData("delay")}>
                        {#if sortState.column === "delay"}
                            {#if sortState.asc}
                                🔼
                            {:else}
                                🔽
                            {/if}
                        {:else}
                            ↕️
                        {/if}
                    </button>
                </th>
            </tr>
        </thead>
        <tbody>
            {#each gateways as gateway}
                <tr>
                    <td title={gateway.label}>
                        <a href="{gateway.protocol}://{gateway.fqdn}" target="_blank" rel="noopener noreferrer">
                            {gateway.fqdn}
                        </a>
                    </td>
                    <td>{gateway.startTime}</td>
                    <td>{gateway.stake}k</td>
                    <td>
                        <a
                            href={gateway.protocol + "://" + domain + "." + gateway.fqdn}
                            target="_blank"
                            rel="noopener noreferrer">
                            {$t("gateway.clickVisit")}
                        </a>
                    </td>
                    <td><button onclick={() => checkGateway(gateway)}>{@html gateway.state}</button></td>
                    <td>
                        {#if gateway.delay > 0}{gateway.delay}s{/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    <h2>{$t("gateway.leavingGateway")}</h2>
    <p>
        {$t("gateway.leavingCount")}
        <strong>{leavingGateways.length}</strong>
    </p>
    <table aria-label="Leaving Gateway List">
        <thead>
            <tr>
                <th>{$t("gateway.fqdn")}</th>
                <th>{$t("gateway.joinDate")}</th>
                <th>{$t("gateway.stakeIO")}</th>
            </tr>
        </thead>
        <tbody>
            {#each leavingGateways as gateway}
                <tr>
                    <td title={gateway.label}><a href="{gateway.protocol}://{gateway.fqdn}" rel="noopener noreferrer" 
                        target="_blank">{gateway.fqdn}</a></td>
                    <td>{gateway.startTime}</td>
                    <td>{gateway.stake}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else if !isIOError}
    <h3>{$t("gateway.loadingGateways")}</h3>
{:else}
    <h3>{$t("gateway.loadingFailed")}</h3>
    <p>
        {$t("gateway.errorInfo")}
        <code>
            {ioError}
        </code>
    </p>
{/if}

<style>
    .hidden {
        display: none;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        font-size: 13px;
    }

    td {
        padding: 4px;
        text-align: left;
        border: 1px solid #ddd;
    }

    th {
        padding: 4px;
        border: 1px solid #ddd;       
        text-align: center;
    }    

    th button {
        background: none;
        border: none;
        cursor: pointer;
        font-size: inherit;
        padding: 0;
        color: inherit;
    }

    a {
        text-decoration: none;
    }
</style>
