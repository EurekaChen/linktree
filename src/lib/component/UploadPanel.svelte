<script>
  import { upload } from "$lib/upload";
  import { t } from "$lib/i18n";

  let { uploadEnabled=$bindable(), showLinktreeId=$bindable(), linktreeId= $bindable() } = $props();

  let isUploading = $state(false);
  let uploadFailed = $state(false);

  //let linktreeId = $state("4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y"); //这是demo的id

  //查看缓存中是否有lintreeId
  if (typeof window !== "undefined") {
    let getlinktreeId = localStorage.getItem("linktreeId");
    if (getlinktreeId) {
      //如果有的话，说明刚刚上传，需要显示
      linktreeId = getlinktreeId;
      showLinktreeId = true;
    }
  }
  async function turboUpload() {
    isUploading = true;
    showLinktreeId = false;
    uploadFailed=false;
    linktreeId = await upload();
    if (linktreeId == "failed") {
      //上传失败
      isUploading = false;
      uploadFailed = true;
      showLinktreeId = false;
    } else {
      //上传成功
      isUploading = false;
      uploadEnabled = false;
      showLinktreeId = true;
      localStorage.setItem("linktreeId", linktreeId);
    }
  }
</script>

<button
  disabled={!uploadEnabled}
  title={$t("upload.modifyToActive")}
  onclick={turboUpload}>{$t("upload.uploadToArweave")}</button
>
<p style="font-size: 12px;margin-bottom:5px;" class:hidden={!isUploading}>
  {$t("upload.uploading")}
</p>
<p style="font-size:12px; margin-bottom:5px;color:darkgreen" class:hidden={!showLinktreeId}>
  {$t("upload.latestId")} <code>{linktreeId}</code>
</p>
<p style="font-size:12px; margin-bottom:5px;color:darkred" class:hidden={!uploadFailed}>
  {$t("upload.uploadFailed")} 
</p>

<style>
  .hidden {
      display: none;
  } 
</style>