<script lang="ts">
    import { log } from "$lib/store/Debug";
    import { onMount } from "svelte";

    let domain = "hello_linktree";
    let isChecking = $state(false);
    let title = $state("ar.io网关可用性检测");
    let description = $state("");

    let namePattern = /^(?:[a-zA-Z0-9_-]+)$/; //名称允许字符，字母和连字符和下划线（来自ar.iob除去@)

    if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);

        const undername = params.get("undername"); //?undername=eureka
        if (undername && namePattern.test(undername)) {
            title = undername;
            domain = undername + "_linktree";
            description =
                '您还可以通过下表中的网关访问到<code><a href="https://' +
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
                '您还可以通过下表中的网关访问到<code><a href="https://' +
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
                        state: "检测",
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
        checked = 1;
        for (let gateway of gateways) {
            if (!isChecking) return;
            await checkGateway(gateway);
            checked++;
        }
    }

    async function checkGateway(gateway: Gateway) {
        gateway.state = "检测中...";
        const startTime = performance.now();
        try {
            let url = gateway.protocol + "://" + domain + "." + gateway.fqdn;
            const response = await fetch(url, { cache: "no-store" });
            if (response.ok) {
                if (domain == "hello_linktree") {
                    const fetchText = await response.text(); // 将响应体解析为文本返回
                    const matched = fetchText == helloText;
                    if (matched) {
                        gateway.state = '<span title="正确获取Hello, Eureka World!">✅网关正常</span>';
                    } else {
                        gateway.state = '<span title="不能正确获取Hello, Eureka World!">⚠网关异常</span>';
                    }
                } else {
                    gateway.state = '<span title="能正常访问' + url + '">✅访问正常</span>';
                }
            } else {
                gateway.state = '<span title="访问' + url + '出错">' + "✅" + response.status + "错误</span>";
            }
        } catch (error) {
            let errorMsg: string = error instanceof Error ? error.message : "未知错误";
            gateway.state = '<span  title="' + errorMsg + '">❌网关出错</span>';
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

<h1>{title}</h1>

{#if gateways.length > 0}
    <p>{@html description}</p>
    <button onclick={checkGateways}>{isChecking ? "停止网关可用性检测" : "测试所有网关可用性"}</button>
    <p style="font-size:14px">
        <span>共有{gateways.length}个网关加入中(首次访问耗时较多)</span>
        <span class:hidden={!isChecking}>正在检测第{checked}个网关的可有性</span>
    </p>
    <table>
        <thead>
            <tr>
                <th
                    >网关FQDN(域名)
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
                    </button></th>
                <th
                    >加入时间 <button onclick={() => sortData("startTime")}>
                        {#if sortState.column === "startTime"}
                            {#if sortState.asc}
                                🔼
                            {:else}
                                🔽
                            {/if}
                        {:else}
                            ↕️
                        {/if}
                    </button></th>
                <th
                    >抵押(IO)<button onclick={() => sortData("stake")}>
                        {#if sortState.column === "stake"}
                            {#if sortState.asc}
                                🔼
                            {:else}
                                🔽
                            {/if}
                        {:else}
                            ↕️
                        {/if}
                    </button></th>
                <th>访问链接</th>
                <th>可用性检测</th>
                <th
                    >检测耗时<button onclick={() => sortData("stake")}>
                        {#if sortState.column === "delay"}
                            {#if sortState.asc}
                                🔼
                            {:else}
                                🔽
                            {/if}
                        {:else}
                            ↕️
                        {/if}
                    </button></th>
            </tr>
        </thead>
        <tbody>
            {#each gateways as gateway}
                <tr>
                    <td title={gateway.label}
                        ><a href="{gateway.protocol}://{gateway.fqdn}" target="_blank" rel="noopener noreferrer"
                            >{gateway.fqdn}</a
                        ></td>
                    <td>{gateway.startTime}</td>
                    <td>{gateway.stake}k</td>
                    <td
                        ><a
                            href={gateway.protocol + "://" + domain + "." + gateway.fqdn}
                            target="_blank"
                            rel="noopener noreferrer">点击打开</a
                        ></td>
                    <td><button onclick={() => checkGateway(gateway)}>{@html gateway.state}</button></td>
                    <td
                        >{#if gateway.delay > 0}{gateway.delay}s{/if}</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <h2>已退出网关</h2>
    <p>共有{leavingGateways.length}个网关已经退出</p>
    <table>
        <thead>
            <tr>
                <th>网关FQDN(域名) </th>
                <th>加入时间 </th>
                <th>抵押(IO)</th>
            </tr>
        </thead>
        <tbody>
            {#each leavingGateways as gateway}
                <tr>
                    <td title={gateway.label}><a href="{gateway.protocol}://{gateway.fqdn}">{gateway.fqdn}</a></td>
                    <td>{gateway.startTime}</td>
                    <td>{gateway.stake}</td>
                </tr>
            {/each}
        </tbody>
    </table>
{:else if !isIOError}
    <h2>正在加载网关数据...</h2>
{:else}
    <h2>加载网关数据失败</h2>
    <p>
        错误信息:
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
        background-color: #f2f2f2;
        text-align: center;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
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
