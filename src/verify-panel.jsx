import * as openpgp from "openpgp";
import { createSignal } from "solid-js";
import UploadKey from "./Upload-key";

export default () => {
  const [publicKeyText, setPublicKeyText] = createSignal("");
  const [signedText, setSignedText] = createSignal("");
  const [verifiedText, setVerifiedText] = createSignal("");
  const [fileRef, setFileRef] = createSignal(null);
  const [sigRef, setSigRef] = createSignal(null);
  const [status, setStatus] = createSignal("");

  /** 验证文本签名 **/
  const verifyText = async () => {
    try {
      setStatus("Verifying text signature...");

      const publicKey = await openpgp.readKey({
        armoredKey: publicKeyText(),
      });

      const message = await openpgp.readCleartextMessage({
        cleartextMessage: signedText(),
      });

      const result = await openpgp.verify({
        message,
        verificationKeys: publicKey,
      });

      await result.signatures[0].verified;

      setVerifiedText(result.data);
      setStatus("Signature valid 🎉");
    } catch (err) {
      setStatus("❌ Signature invalid"+JSON.stringify({name: err.name, message: err.message}));
    }
  };

  /** 验证文件 + detached sig **/
  const verifyFile = async () => {
    try {
      const file = fileRef()?.files?.[0];
      const sigFile = sigRef()?.files?.[0];
      if (!file || !sigFile) return;

      setStatus("Verifying file signature...");

      const publicKey = await openpgp.readKey({
        armoredKey: publicKeyText(),
      });

      const data = new Uint8Array(await file.arrayBuffer());
      const sigData = new Uint8Array(await sigFile.arrayBuffer());

      const message = await openpgp.createMessage({ binary: data });
      const signature = await openpgp.readSignature({
        binarySignature: sigData,
      });

      const result = await openpgp.verify({
        message,
        signature,
        verificationKeys: publicKey,
      });

      await result.signatures[0].verified;

      setStatus("File signature valid 🎉");
    } catch (err) {
      setStatus("❌ File signature invalid"+JSON.stringify({name: err.name, message: err.message}));
    }
  };

  return (
    <div class="card">
      <h2>5. Verify Signature (require public key)</h2>

      <label>
        <div>Enter recipient public key or</div>
        <UploadKey callback={setPublicKeyText} />
      </label>
      <textarea
        value={publicKeyText()}
        onInput={(e) => setPublicKeyText(e.currentTarget.value)}
        placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"
      />

      <div class="grid">
        {/* Verify Text */}
        <div>
          <label>Option A: Verify Signed Text</label>

          <textarea
            value={signedText()}
            onInput={(e) => setSignedText(e.currentTarget.value)}
            placeholder="Paste clear-signed message..."
          />

          <button onclick={verifyText}>Verify Text Signature</button>

          <textarea
            readonly
            value={verifiedText()}
            placeholder="Verified plain text output..."
          />
        </div>

        {/* Verify File */}
        <div>
          <label>Option B: Verify File + .sig</label>

          <input
            hidden={true}
            type="file"
            ref={(el) => setFileRef(el)}
            accept="*"
          />

          <input
            hidden={true}
            type="file"
            ref={(el) => setSigRef(el)}
            accept=".sig,.asc"
          />

          <button onclick={() => fileRef()?.click()}>Upload File</button>
          <div style={{
            "display":"inline-block",
            "width":"9px"
          }}></div>
          <button onclick={() => sigRef()?.click()}>Upload Signature</button>

          <button onclick={verifyFile}>Verify File Signature</button>
        </div>
      </div>

      <div class="status">{status()}</div>
    </div>
  );
};
