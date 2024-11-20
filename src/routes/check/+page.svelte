<script lang="ts">
    import { log } from "$lib/store/Debug";
    import { onMount } from "svelte";

    let gateways = $state([]); // 移除 $state，使用普通声明
    let leavingGateways=$state([]);

    async function fetchGateways() {
        try {
            log("获取网关");
            const module = await import("@ar.io/sdk/web");
            const IO = module.IO;
            const io = IO.init();
            const result = await io.getGateways({
                limit: 500,
                sortOrder: "asc",
                sortBy: "settings.fqdn"
            });

            for(let item of result.items)
            {
                if(item.status=="leaving"){
                    let leaving={
                        label:item.settings.label,
                        fqdn:item.settings.fqdn,
                        protocol:item.settings.protocol
                    }
                    leavingGateways.push(leaving);
                }
                else{

                let gateway={
                    label:item.settings.label,
                    fqdn:item.settings.fqdn,
                    protocol:item.settings.protocol,
                    url:item.settings.protocol+"://hello_linktree."+ item.settings.fqdn,
                    stake:Math.round(item.operatorStake/10000000)/100,
                    status:item.status,
                    startTime: new Date(item.startTimestamp).toLocaleDateString(),
                    online:"",
                    delay:0,
                }
                gateways.push(gateway);
            }
            }
            //gateways = result.items; // 直接赋值更新
            log(gateways);
        } catch (error) {
            console.error("导入IO失败:", error);
        }
    }

	onMount(() => {
		fetchGateways();
	});

const helloText = '<h1>Hello, Eureka World!</h1>';

let total=$state(0);

let cancel=false;

async function checkGateways () {
  total = gateways.length
  let checked = 0
  for(let gateway of gateways){
    if(cancel) return;
    //const helloUrl=gateway.settings.protocol+"://hello_linktree."+ gateway.settings.fqdn;
    const startTime = performance.now();
    try {
        const response = await fetch(gateway.url);
        if(response.ok){
            const fetchText = await response.text(); // 将响应体解析为JSON
            const matched = fetchText== helloText;                      
        }
        else{
            throw new Error(`HTTP error! status: ${response.status}`);
        }       
    } catch (error) {
        console.error('Error:', error);
    }
    const endTime = performance.now();
    const delay=endTime-startTime;
    gateway.delay=delay;
    checked++;
  }
}

</script>

<img
    src="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780"
    class="avatar"
    srcset="https://arweave.net/8MfM94Fd7MRBeQ9-265gGL-EgqMXE6OINSZx5bAu780 2x"
    alt="Gateways" />

<div>
    <h1>网关可用性测试</h1>
    <p>您还可以通过以下网关访问https://hello_linktree.ar.io</p>
</div>
<button onclick={checkGateways}>测试所有网关的可访问性</button>

{#if gateways.length > 0}
    <table>
        <thead>
            <tr>               
                <th>网关FQDN(域名)</th>
                <th>加入时间</th>
                <th>抵押(IO)</th>
                <th>访问链接</th>
                <th>可访问测试</th>                
                <th>测试耗时</th>
            </tr>
        </thead>
        <tbody>
            {#each gateways as gateway}
                <tr>                   
                    <td title={gateway.label}><a href="{gateway.protocol}://{gateway.fqdn}">{gateway.fqdn}</a></td>
                    <td>{gateway.startTime}</td>
                    <td>{gateway.stake}K</td>
                    <td><a href="{gateway.url}">hello_linktree</a></td>
                    <td><button>未测试</button></td>                    
                    <td>{gateway.status}</td>
                   
                </tr>
            {/each}
        </tbody>
    </table>
{:else}
    <h2>正在加载网关数据...</h2>
{/if}

<style>
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 10px 0;
        font-size:13px;
    }
   
    td {
        padding:4px;
        text-align: left;
        border: 1px solid #ddd;
    }

    th {
        padding:4px;
        border: 1px solid #ddd;
        background-color: #f2f2f2;
        text-align: center;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
</style>