<script>
  import { upload } from "$lib/upload";

  let { uploadEnabled, showLinktreeId } = $props();

  let isUploading = $state(false);
  let uploadFailed = $state(false);

  let linktreeId = $state("4zxHDSCFspfjijZy3XY6QMr28LKEgqICwv7iw-zzR3Y"); //这是demo的id

  console.log("uploadPanbel,isuploading:",isUploading);
  
  if (typeof window !== "undefined") {
    let getlinktreeId = localStorage.getItem("linktreeId");
    if (getlinktreeId) {
      linktreeId = getlinktreeId;
      showLinktreeId = true;
    }
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

<style>
  .hidden {
      display: none;
  } 
</style>