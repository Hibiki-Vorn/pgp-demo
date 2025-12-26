import * as openpgp from "openpgp";
import { createSignal } from "solid-js";

export default () => {
  const [encryptKey, setEncryptKey] = createSignal("");
  const [plainText, setPlainText] = createSignal("");
  const [encryptedText, setEncryptedText] = createSignal("");
  const [fileRef, setFileRef] = createSignal(null);
  const [status, setStatus] = createSignal("");

  /** 文本加密 **/
  const encryptText = async () => {
    try {
      setStatus("Encrypting text...");

      const publicKey = await openpgp.readKey({
        armoredKey: encryptKey(),
      });

      const message = await openpgp.createMessage({
        text: plainText(),
      });

      const encrypted = await openpgp.encrypt({
        message,
        encryptionKeys: publicKey,
      });

      setEncryptedText(encrypted);
      setStatus("Text encrypted successfully 🎉");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to encrypt text");
    }
  };

  /** 文件加密 **/
  const encryptFile = async () => {
    try {
      const file = fileRef()?.files?.[0];
      if (!file) return;

      setStatus("Encrypting file...");

      const publicKey = await openpgp.readKey({
        armoredKey: encryptKey(),
      });

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const message = await openpgp.createMessage({
        binary: uint8Array,
      });

      const encrypted = await openpgp.encrypt({
        message,
        encryptionKeys: publicKey,
        format: "binary", // 返回 Uint8Array
      });

      const blob = new Blob([encrypted], {
        type: "application/pgp-encrypted",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name + ".pgp";
      a.click();
      URL.revokeObjectURL(url);

      setStatus("File encrypted successfully 🎉");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to encrypt file");
    }
  };

  return (
    <div class="card">
      <h2>2. Encrypt (require public key)</h2>

      <label>Enter recipient public key:</label>
      <textarea
        value={encryptKey()}
        onInput={(e) => setEncryptKey(e.currentTarget.value)}
        placeholder="-----BEGIN PGP PUBLIC KEY BLOCK-----"
      />

      <div class="grid">
        {/* Text */}
        <div>
          <label>Option A: Encrypt Text</label>

          <textarea
            value={plainText()}
            onInput={(e) => setPlainText(e.currentTarget.value)}
            placeholder="Enter text to encrypt..."
          />

          <button onclick={encryptText}>Encrypt Text</button>

          <textarea
            readonly
            value={encryptedText()}
            placeholder="Encrypted text will appear here..."
          />

          <button
            class="secondary"
            onclick={() =>
              window.navigator.clipboard.writeText(encryptedText())
            }
          >
            Copy Encrypted Result
          </button>
        </div>

        {/* File */}
        <div>
          <label>Option B: Encrypt File</label>

          <input
            type="file"
            hidden
            ref={(el) => setFileRef(el)}
            onChange={encryptFile}
          />

          <button onclick={() => fileRef().click()}>
            Encrypt and Download File
          </button>
        </div>
      </div>

      <div class="status">{status()}</div>
    </div>
  );
};
