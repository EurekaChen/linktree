# 设计思路

- 以简单的编辑当前页面
- 然后直接将当前页面的组成要数做成html页面上传到Arweave上得到txid（LinktreeId）
- 然后将txid和Undername发布到ArNS中。

编辑当前页面的要素会通过LocalStorage存储在用户的浏览器中，这样用户第二次访问的时候会保持编辑过的页面。用户也可以清除缓存，这样会得到默认页面。

默认页面由 defaultData 这个对象提供，并使用当前网关的域名。
通过读取default.json然后用字符串替换。

获取当前网关域名，例如arweave.net，代替默认的ar.io

保存在浏览器缓存中的数据有：linktree,undername和linktreeId

每次对页面进行修改则会产生一个新的linktree，因此原linktreeId作废（不再显示），需通过上传生成新的id。


showLinktreeId：
初始没有保存的linktreeId时，showLinktreedID为false，uploadEnabled为false
当上传成功的时候显示，并且uploadEnabled为false。
当修改并保存数据后，showLinktreeId为false，并且uploadEnabled为true。

底部显示：
当前页面linktreeid和undername 匹配，则显示成功发布。
